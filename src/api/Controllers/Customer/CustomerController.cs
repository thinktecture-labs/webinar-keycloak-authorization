using System;
using System.Collections.Generic;
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
    public class CustomerController: ControllerBase
    {
        private readonly ApiDbContext _context;

        public CustomerController(ApiDbContext context)
        {
            _context = context;
        }
        
        [HttpGet]
        [Authorize("customers#read")]
        public async Task<ActionResult<IEnumerable<CustomerModel>>> List()
        {
            return await _context.Customers.Select(c => new CustomerModel(c.Id, c.Name)).ToArrayAsync();
        }

        [HttpGet("{id:guid}")]
        [Authorize("customers#read")]
        public async Task<ActionResult<CustomerModel>> Detail(Guid id)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == id);
            if (customer == null)
            {
                return NotFound(id);
            }

            return new CustomerModel(customer.Id, customer.Name);
        }
        
        [HttpPost("{id:guid}")]
        [Authorize("customers#update")]
        public async Task<ActionResult<CustomerModel>> Update(Guid id, CustomerInputModel inputModel)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == id);
            if (customer == null)
            {
                return NotFound();
            }

            customer.Name = inputModel.Name;
            await _context.SaveChangesAsync();

            return Ok(new CustomerModel(customer.Id, customer.Name));
        }
        
        [HttpDelete("{id:guid}")]
        [Authorize("customers#delete")]
        public async Task<ActionResult<CustomerModel>> Delete(Guid id)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == id);
            if (customer == null)
            {
                return NotFound();
            }

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}