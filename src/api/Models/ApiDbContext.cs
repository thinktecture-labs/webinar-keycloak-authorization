using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace API.Models
{
    public class ApiDbContext: DbContext
    {
        public DbSet<Customer> Customers => Set<Customer>();

        public DbSet<Project> Projects => Set<Project>();

        public ApiDbContext(DbContextOptions<ApiDbContext> options): base(options)
        {
            
        }
    }
}