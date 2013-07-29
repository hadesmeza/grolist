using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GROLIAAS.Models
{
    public class GroliSectionModel
    {
        public string SectionName { get; set; }
        public IEnumerable<GroliItemModel> Items { get; set; }
    }
}