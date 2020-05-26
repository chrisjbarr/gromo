using System.ComponentModel.DataAnnotations;

namespace Yak.Gromo.Api.Entities
{
    public class Exercise : EntityBase
    {
        [Required()]
        [MaxLength(128)]
        public string Name { get; set; }

        [Required()]
        [MaxLength(128)]
        public string Description { get; set; }

        [Required()]
        public ExerciseType ExerciseType { get; set; }


    }
}
