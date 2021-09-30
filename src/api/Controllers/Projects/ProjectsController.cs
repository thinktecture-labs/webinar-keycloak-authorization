using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Threading.Tasks;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly ApiDbContext _context;

        public ProjectsController(ApiDbContext context)
        {
            _context = context;
        }

        [HttpGet("/Customer/{customerId:guid}/projects")]
        [Authorize("projects#read")]
        public async Task<ActionResult<IEnumerable<ProjectModel>>> List(Guid customerId)
        {
            return await _context.Projects.Include(p => p.Customer)
                .Where(p => p.CustomerId == customerId)
                .Select(project => new ProjectModel(project.Id
                    , project.Customer.Name
                    , project.Name
                    , project.ProjectLead
                    , project.IsArchived))
                .ToArrayAsync();
        }

        [HttpGet("{id:guid}")]
        [Authorize("projects#read")]
        public async Task<ActionResult<ProjectModel>> Detail(Guid id)
        {
            var project = await _context.Projects.Include(p => p.Customer).FirstOrDefaultAsync(c => c.Id == id);
            if (project == null)
            {
                return NotFound(id);
            }

            return new ProjectModel(project.Id
                , project.Customer.Name
                , project.Name
                , project.ProjectLead
                , project.IsArchived);
        }

        [HttpPut("/Customer/{customerId:guid}/projects")]
        [Authorize("projects#create")]
        public async Task<ActionResult<ProjectModel>> Create(Guid customerId
            , CreateProjectModel inputModel
            , [FromServices] KeycloakService keycloakService)
        {
            var project = new Project()
            {
                Id = Guid.NewGuid()
                , CustomerId = customerId
                , Name = inputModel.Name
                , ProjectLead = inputModel.ProjectLead
            };

            await _context.Projects.AddAsync(project);
            await _context.SaveChangesAsync();

            await keycloakService.CreateResource(new Resource()
            {
                Name = $"projects/{project.Id}"
                , Type = "urn:api:resource:project"
                , Scopes = new[] {"archive"}
                , Attributes =
                {
                    {"projectlead", project.ProjectLead}
                }
            });

            return NoContent();
        }

        // "Roll your own" authorization
        // Role check in application
        [Authorize(Roles = Roles.ProjectManager)]
        [HttpPost("{id:guid}")]
        public async Task<ActionResult<ProjectModel>> Update(Guid id, UpdateProjectModel inputModel)
        {
            var project = await _context.Projects.Include(p => p.Customer).FirstOrDefaultAsync(p => p.Id == id);
            if (project == null)
            {
                return NotFound();
            }

            // "Roll your own" authorization
            // Access to project check in application
            if (!project.ProjectLead.Equals(User.Identity.Name, StringComparison.InvariantCultureIgnoreCase))
            {
                return Forbid();
            }

            project.Name = inputModel.Name;
            await _context.SaveChangesAsync();

            return new ProjectModel(project.Id
                , project.Customer.Name
                , project.Name
                , project.ProjectLead
                , project.IsArchived);
        }

        [HttpDelete("{id:guid}")]
        [Authorize("projects#delete")]
        public async Task<ActionResult> Delete(Guid id)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(c => c.Id == id);
            if (project == null)
            {
                return NotFound();
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id:guid}/archive")]
        [Authorize("projects#archive")]
        public async Task<ActionResult> Archive(Guid id)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(c => c.Id == id);
            if (project == null)
            {
                return NotFound();
            }

            project.IsArchived = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}