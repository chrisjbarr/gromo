using System;
using System.Linq;
using HotChocolate;
using HotChocolate.Types;
using Yak.Gromo.Api;
using Yak.Gromo.Api.Entities;

namespace YakGromo.Api.GraphQL
{
    public class Query
    {
        [UseSelection]
        [UseFiltering]
        [UseSorting]
        public IQueryable<Gromoer> GetGromoers([Service] AppDbContext context) => context.Gromoers;

        [UseFirstOrDefault]
        [UseSelection]
        public IQueryable<Gromoer> GetGromoer([Service] AppDbContext context, Guid id) =>
            context.Gromoers.Where(t => t.Id == id);

        [UseSelection]
        [UseFiltering]
        [UseSorting]
        public IQueryable<Exercise> GetExercises([Service] AppDbContext context) => context.Exercises;
    }
}