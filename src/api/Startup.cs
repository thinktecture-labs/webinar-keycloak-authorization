using System;
using System.IO;
using API.Authentication;
using API.Authorization.Decision;
using API.Authorization.RPT;
using API.Models;
using IdentityModel.Client;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace API
{
    public class Startup
    {
        private const string _roleClaimType = "role";

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddHttpContextAccessor();

            services.AddCors(options =>
            {
                options.AddDefaultPolicy(builder =>
                {
                    builder.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin();
                });
            });
            services.AddControllers();
            services.AddDbContext<ApiDbContext>(options =>
            {
                var databasePath = Path.Combine(Path.GetTempPath(), "webinar-keycloak-authorization.db");
                options.UseSqlite($"Data Source={databasePath}");
            });

            var jwtOptions = Configuration.GetSection("JwtBearer").Get<JwtBearerOptions>();
            services
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.Authority = jwtOptions.Authority;
                    options.Audience = jwtOptions.Audience;
                    options.RequireHttpsMetadata = false;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        NameClaimType = "preferred_username"
                        ,
                        // Specify what the claim name is, for roles.
                        // Needed so ASP.NET Core knowns where to look for the roles of the user.
                        RoleClaimType = _roleClaimType
                    };
                });

            services.AddTransient<IClaimsTransformation>(_ =>
                new KeycloakRolesClaimsTransformation(_roleClaimType, jwtOptions.Audience));

            services.AddSingleton<IAuthorizationHandler, DecisionRequirementHandler>();
            services.AddSingleton<IAuthorizationHandler, RptRequirementHandler>();
            services.AddAuthorization(options =>
            {
                #region Decision Requirements

                options.AddPolicy("customers#read"
                    , builder => builder.AddRequirements(new DecisionRequirement("customers", "read"))
                );

                options.AddPolicy("customers#update"
                    , builder => builder.AddRequirements(new DecisionRequirement("customers", "update"))
                );

                options.AddPolicy("customers#delete"
                    , builder => builder.AddRequirements(new DecisionRequirement("customers", "delete"))
                );

                #endregion

                #region Rpt Requirements

                options.AddPolicy("projects#create"
                    , builder => builder.AddRequirements(new RptRequirement("projects", "create"))
                );

                options.AddPolicy("projects#read"
                    , builder => builder.AddRequirements(new RptRequirement("projects", "read"))
                );

                options.AddPolicy("projects#delete"
                    , builder => builder.AddRequirements(new RptRequirement("projects", "delete"))
                );

                #endregion

                #region Resource Based RPT requirement

                options.AddPolicy("projects#archive"
                    , builder => builder.RequireAssertion(async context =>
                    {
                        var httpContext = context.Resource as HttpContext;
                        var authorizationService =
                            httpContext.RequestServices.GetRequiredService<IAuthorizationService>();
                        var policy =
                            new AuthorizationPolicyBuilder(JwtBearerDefaults.AuthenticationScheme)
                                .AddRequirements(new RptRequirement(
                                    $"projects/{httpContext.Request.RouteValues["id"]}"
                                    , "archive")
                                ).Build();

                        var result = await authorizationService.AuthorizeAsync(httpContext.User, policy);

                        return result.Succeeded;
                    }));

                #endregion
            });

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1"
                    , new OpenApiInfo
                    {
                        Title = "API"
                        , Version = "v1"
                    });
            });

            services.AddHttpClient<KeycloakService>(client =>
            {
                client.BaseAddress = new Uri(Configuration["KeycloakResourceUrl"]);
            });
            services.AddHttpClient<TokenClient>();
            services.AddSingleton<ClientCredentialsTokenRequest>(_ =>
                Configuration.GetSection("ClientCredentialsTokenRequest").Get<ClientCredentialsTokenRequest>());
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1"));
            }

            app.UseHttpsRedirection();
            app.UseCors();
            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints => { endpoints.MapControllers(); });
        }
    }
}