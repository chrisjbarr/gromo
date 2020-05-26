using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Yak.Gromo.Api.Entities;

namespace Yak.Gromo.Api.Migrations
{
    public partial class initial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:exercise_type_enum", "StrengthTraining,Time")
                .Annotation("Npgsql:PostgresExtension:uuid-ossp", ",,");

            migrationBuilder.CreateTable(
                name: "exercises",
                columns: table => new
                {
                    id = table.Column<Guid>(nullable: false, defaultValueSql: "uuid_generate_v4()"),
                    created_at = table.Column<DateTime>(nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(nullable: false, defaultValueSql: "now()"),
                    name = table.Column<string>(maxLength: 128, nullable: false),
                    description = table.Column<string>(maxLength: 128, nullable: false),
                    exercise_type = table.Column<ExerciseType>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_exercises", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "gromoers",
                columns: table => new
                {
                    id = table.Column<Guid>(nullable: false, defaultValueSql: "uuid_generate_v4()"),
                    created_at = table.Column<DateTime>(nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTime>(nullable: false, defaultValueSql: "now()"),
                    first_name = table.Column<string>(maxLength: 128, nullable: false),
                    last_name = table.Column<string>(maxLength: 128, nullable: false),
                    email_address = table.Column<string>(maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_gromoers", x => x.id);
                });

            migrationBuilder.InsertData(
                table: "exercises",
                columns: new[] { "id", "description", "exercise_type", "name" },
                values: new object[,]
                {
                    { new Guid("e02259aa-4d8a-454c-86bc-147f55bd9fb8"), "Stretching", ExerciseType.Time, "Stretching" },
                    { new Guid("724475fb-270f-4c77-b710-496b01e3e34c"), "Walking", ExerciseType.Time, "Walking" },
                    { new Guid("486ac0bf-0dac-42df-9161-43a4836c86a0"), "Running", ExerciseType.Time, "Running" },
                    { new Guid("2c973571-efeb-43a8-b7d5-ed3d2457333f"), "Plank", ExerciseType.Time, "Plank" },
                    { new Guid("3c4660bf-f3c2-48d1-8af5-4c97b52c1e31"), "Bench Press", ExerciseType.StrengthTraining, "Bench Press" },
                    { new Guid("905fcda1-18c5-4c98-9e41-749b25c9424d"), "Incline Bench Press", ExerciseType.StrengthTraining, "Incline Bench Press" },
                    { new Guid("f12c6c2d-ffab-446e-b793-c4fae103ce5e"), "Decline Bench Press", ExerciseType.StrengthTraining, "Decline Bench Press" },
                    { new Guid("dfce97a9-d6b6-4bf9-9978-baa91abbb21f"), "Incline Dumbbell Chest Press", ExerciseType.StrengthTraining, "Incline Dumbbell Chest Press" }
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "exercises");

            migrationBuilder.DropTable(
                name: "gromoers");
        }
    }
}
