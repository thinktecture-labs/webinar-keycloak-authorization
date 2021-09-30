using System;

namespace API.Models
{
    public record Project
    {
        public Project()
        {
            Name = String.Empty;
        }

        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }
        public Customer Customer { get; set; }
        public string Name { get; set; }

        public string ProjectLead { get; set; }
        public bool IsArchived { get; set; }
    }
}