using System;

namespace API.Models
{
    public class Customer
    {
        public Customer()
        {
            Name = String.Empty;
        }
        
        public Guid Id { get; set; }

        public string Name { get; set; }
    }
}