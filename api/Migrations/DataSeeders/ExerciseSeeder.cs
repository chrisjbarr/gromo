using System;
using System.Collections.Generic;
using Yak.Gromo.Api.Entities;

namespace Yak.Gromo.Api.Migrations.DataSeeders
{
    public static class ExerciseSeeder
    {
        public static class Ids
        {
            public static readonly Guid Stretching = new Guid("E02259AA-4D8A-454C-86BC-147F55BD9FB8");
            public static readonly Guid Walking = new Guid("724475FB-270F-4C77-B710-496B01E3E34C");
            public static readonly Guid Running = new Guid("486AC0BF-0DAC-42DF-9161-43A4836C86A0");
            public static readonly Guid BenchPress = new Guid("3C4660BF-F3C2-48D1-8AF5-4C97B52C1E31");
            public static readonly Guid InclineBenchPress = new Guid("905FCDA1-18C5-4C98-9E41-749B25C9424D");
            public static readonly Guid DeclineBenchPress = new Guid("F12C6C2D-FFAB-446E-B793-C4FAE103CE5E");
            public static readonly Guid Plank = new Guid("2C973571-EFEB-43A8-B7D5-ED3D2457333F");
            public static readonly Guid InclineDumbbellChestPress = new Guid("DFCE97A9-D6B6-4BF9-9978-BAA91ABBB21F");
        }

        public static IEnumerable<Exercise> Data => new List<Exercise>
            {
                new Exercise
                {
                    Id = Ids.Stretching,
                    Name = "Stretching",
                    Description = "Stretching",
                    ExerciseType = ExerciseType.Time
                },
                new Exercise
                {
                    Id = Ids.Walking,
                    Name = "Walking",
                    Description = "Walking",
                    ExerciseType = ExerciseType.Time
                },
                new Exercise
                {
                    Id = Ids.Running,
                    Name = "Running",
                    Description = "Running",
                    ExerciseType = ExerciseType.Time
                },
                new Exercise
                {
                    Id = Ids.Plank,
                    Name = "Plank",
                    Description = "Plank",
                    ExerciseType = ExerciseType.Time
                },

                new Exercise
                {
                    Id = Ids.BenchPress,
                    Name = "Bench Press",
                    Description = "Bench Press",
                    ExerciseType = ExerciseType.StrengthTraining
                },
                new Exercise
                {
                    Id = Ids.InclineBenchPress,
                    Name = "Incline Bench Press",
                    Description = "Incline Bench Press",
                    ExerciseType = ExerciseType.StrengthTraining
                },
                new Exercise
                {
                    Id = Ids.DeclineBenchPress,
                    Name = "Decline Bench Press",
                    Description = "Decline Bench Press",
                    ExerciseType = ExerciseType.StrengthTraining
                },
                new Exercise
                {
                    Id = Ids.InclineDumbbellChestPress,
                    Name = "Incline Dumbbell Chest Press",
                    Description = "Incline Dumbbell Chest Press",
                    ExerciseType = ExerciseType.StrengthTraining
                }
            };
    }
}
