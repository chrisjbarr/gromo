using System;
using System.ComponentModel.DataAnnotations;

namespace Yak.Gromo.Api.Entities
{
    public class GromoerExercise : EntityBase
    {
        public Guid GromoerId { get; set; }

        public Guid ExerciseId { get; set; }

        public DateTime PerformedOn { get; set; }

        public virtual Gromoer Gromoer { get; set; }

        public virtual Exercise Exercise { get; set; }
    }
}
