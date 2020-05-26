using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using HotChocolate;
using HotChocolate.AspNetCore;
using HotChocolate.Execution.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Npgsql;
using YakGromo.Api.GraphQL;

namespace Yak.Gromo.Api
{
    public class Startup
    {
        readonly string AllowCorsOriginsPolicy = "__AllowCorsOriginsPolicy";
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            this.Configuration = configuration;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy(name: AllowCorsOriginsPolicy,
                builder =>
                {
                    builder
                        .WithOrigins("http://localhost:8080")
                        .AllowAnyHeader();
                });
            });

            services.AddDbContext<AppDbContext>(options =>
                options
                    .UseNpgsql(Configuration["ConnectionStrings:AppDatabase"])
                    .UseSnakeCaseNamingConvention());


            services.AddGraphQL(
                SchemaBuilder.New()
                    .AddQueryType<Query>()
                    .Create(),
                new QueryExecutionOptions { ForceSerialExecution = true, IncludeExceptionDetails = true });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();
            app.UseCors(AllowCorsOriginsPolicy);
            app.UseGraphQL();
            app.UsePlayground();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapGet("/", async context =>
                {
                    await context.Response.WriteAsync("Hello World!");
                });
            });
        }
    }
}
