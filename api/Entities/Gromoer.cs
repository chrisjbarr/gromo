using System.ComponentModel.DataAnnotations;

namespace Yak.Gromo.Api.Entities
{
    public class Gromoer : EntityBase
    {
        [Required()]
        [MaxLength(128)]
        public string FirstName { get; set; }

        [Required()]
        [MaxLength(128)]
        public string LastName { get; set; }

        [Required()]
        [MaxLength(128)]
        public string EmailAddress { get; set; }
    }
}
