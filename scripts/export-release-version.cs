using var packageJsonFileStream = File.OpenRead("./redisinsight/package.json.json");
var versionPrefix = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.Nodes.JsonObject>(packageJsonFileStream)?["version"]?.GetValue<string>();
var versionSuffix = DateTime.UtcNow.ToString("yyyyMMdd");
var version = $"{versionPrefix}-{versionSuffix}".Trim('-');
var envFile = Environment.GetEnvironmentVariable("GITHUB_ENV");
File.WriteAllText(envFile, $"ReleaseVersion={version}");
Console.WriteLine(File.ReadAllText(envFile));
