using System.Linq;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Yak.Gromo.Api.Entities;
using Yak.Gromo.Api.Migrations.DataSeeders;

namespace Yak.Gromo.Api
{
    public partial class AppDbContext : DbContext
    {
        public virtual DbSet<Gromoer> Gromoers { get; set; }

        public virtual DbSet<Exercise> Exercises { get; set; }

        public AppDbContext()
        {
        }

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        static AppDbContext()
        {
            NpgsqlConnection.GlobalTypeMapper.MapEnum<ExerciseType>("exercise_type_enum");
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasPostgresEnum("exercise_type_enum", new[] { "StrengthTraining", "Time" })
                .HasPostgresExtension("uuid-ossp");

            foreach (var entityType in modelBuilder.Model.GetEntityTypes().Where(t => t.ClrType.IsSubclassOf(typeof(EntityBase))))
            {
                modelBuilder.Entity(
                    entityType.Name,
                    x =>
                    {
                        x.Property("CreatedAt")
                            .HasDefaultValueSql("now()");

                        x.Property("UpdatedAt")
                            .HasDefaultValueSql("now()");

                        x.Property("Id")
                            .HasDefaultValueSql("uuid_generate_v4()");
                    });
            }

            seedSchema(modelBuilder);

            OnModelCreatingPartial(modelBuilder);

        }

        private void seedSchema(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Exercise>().HasData(ExerciseSeeder.Data);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);


    }
}
