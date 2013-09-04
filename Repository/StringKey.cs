using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GROLIAAS.Repository
{
    public class StringKey
    {
        static readonly Random rand = new Random();
        public static string New { get { return GetString(Guid.NewGuid()); } }
        private static string GetString(Guid guid)
        {
            var parts = guid.ToString().Split('-')[0].ToCharArray();
            for (var i = 0; i < parts.Length; i++)
                if (isNumber(parts[i]))
                {
                    parts[i] = GetRandomChar(parts[i]);
                }
            return new string(parts);
        }

        private static char GetRandomChar(char p)
        {
             var digits =
                new []
                    {
                        48, 49, 50, 51, 52, 53, 54, 55, 56, 57, //1-9
                        65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, //A_Z
                        97, 98, 99, 100, 101, 102, 103, 104, 105,106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122 //a-z
                    };
             var seed = rand.Next(0, digits.Length);
             return (char)digits[seed];
        }

        private static bool isNumber(int i)
        {
            return i >= 48 && i <= 57;
        }
    }
    
}