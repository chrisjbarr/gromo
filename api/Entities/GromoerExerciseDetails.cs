using System;
using System.ComponentModel.DataAnnotations;

namespace Yak.Gromo.Api.Entities
{
    public class GromoerExerciseDetails : EntityBase
    {
        public Guid GromoerExerciseId { get; set; }

        public DateTime PerformedOn { get; set; }

        public virtual GromoerExercise Gromoer { get; set; }

        public int? SetNumber { get; set; }

        public int? Reps { get; set; }

        public int? Weight { get; set; }

        public int? Time { get; set; }

        public float? Distance { get; set; }
    }
}
