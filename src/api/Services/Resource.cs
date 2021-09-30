using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace API
{
    public class Resource
    {
        public string Name { get; set; }
        public string Type { get; set; }

        [JsonPropertyName("resource_scopes")]
        public string[] Scopes { get; set; }

        public Dictionary<string, string> Attributes { get; set; } = new Dictionary<string, string>();
    }
}