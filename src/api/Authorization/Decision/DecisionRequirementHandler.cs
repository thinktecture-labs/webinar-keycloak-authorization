using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace API.Authorization.Decision
{
    public class DecisionRequirementHandler : AuthorizationHandler<DecisionRequirement>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IOptionsMonitor<JwtBearerOptions> _options;

        public DecisionRequirementHandler(IHttpContextAccessor httpContextAccessor, IOptionsMonitor<JwtBearerOptions> options)
        {
            _httpContextAccessor = httpContextAccessor;
            _options = options;
        }
        
        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, DecisionRequirement requirement)
        {
            var options = _options.Get(JwtBearerDefaults.AuthenticationScheme);
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext != null && httpContext.User.Identity != null && !httpContext.User.Identity.IsAuthenticated)
            {
                context.Fail();
                return;
            }

            var data = new Dictionary<string, string>();
            data.Add("grant_type", "urn:ietf:params:oauth:grant-type:uma-ticket");
            data.Add("response_mode", "decision");
            data.Add("audience", options.Audience);
            data.Add("permission", $"{requirement.Resource}#{requirement.Scope}");

            var client = new HttpClient();
            var token = await httpContext.GetTokenAsync(JwtBearerDefaults.AuthenticationScheme, "access_token");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            
            var configuration = await options.ConfigurationManager.GetConfigurationAsync(CancellationToken.None);
            var response = await client.PostAsync(configuration.TokenEndpoint, new FormUrlEncodedContent(data));
            
            if (response.IsSuccessStatusCode)
            {
                context.Succeed(requirement);
                return;
            }

            context.Fail();
        }
    }
}