using NpgsqlTypes;

namespace Yak.Gromo.Api.Entities
{
    public enum ExerciseType
    {
        [PgName("StrengthTraining")]
        StrengthTraining,

        [PgName("Time")]
        Time,
    }
}
