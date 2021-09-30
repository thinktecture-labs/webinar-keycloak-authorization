using System;

namespace API.Controllers
{
    public record ProjectModel(Guid Id, string CustomerName, string Name, string ProjectLead, bool isArchived);
}