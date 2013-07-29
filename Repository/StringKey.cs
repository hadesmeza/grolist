﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GROLIAAS.Repository
{
    public class StringKey
    {
        static readonly Random rand = new Random();
        public static string New { get { return GetString(Guid.NewGuid()).ToLower(); } }
        private static string GetString(Guid guid)
        {
            var parts = guid.ToString().Split('-')[0].ToCharArray();
            for (var i = 0; i < parts.Length; i++)
                if (isNumber(parts[i])) parts[i] = GetRandomChar(parts[i]);
            return new string(parts);
        }

        private static char GetRandomChar(char p)
        {
            var seed = rand.Next(65, 126);
            if (seed == 96 || seed == 92) seed = rand.Next(65, 126);
            return (char)seed;
        }

        private static bool isNumber(int i)
        {
            int res;
            return int.TryParse(i.ToString(), out res);
        }
    }
    
}