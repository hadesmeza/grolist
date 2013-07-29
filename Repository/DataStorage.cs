using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GROLIAAS.Repository
{
    public static class DataStorage
    {
        static readonly object _locker = new object();
        static readonly ConcurrentDictionary<string, string> _storage = new ConcurrentDictionary<string, string>();
        private static readonly LinkedList<string> _priority = new LinkedList<string>();
        private static int _capacity = 10000;

        public static bool ContainsKey(string key)
        {
            return _storage.ContainsKey(key);
        }

        public static void Update(string session, string items)
        {
            //todo mode key in priority list
            var old = string.Empty;
               if (_storage.TryGetValue(session, out old))
               {
                   _storage.TryUpdate(session, items, old);
               }
               else
               {
                   Put(session, items);
               }
        }

        public static string Get(string usersessionid)
        {
            var items = string.Empty;
            if (_storage.TryGetValue(usersessionid, out items))
            {
                lock (_locker)
                {
                    _priority.Remove(usersessionid);
                    _priority.AddLast(usersessionid);
                }
                return items;
            }

            return items;
        }

        public static void Put(string usersessionid, string items)
        {
            if (_capacity == 0)
            {
                string usess;
                //find least used
                lock (_locker)
                {
                    usess = _priority.First.Value;
                }
                //remove it
                var val = string.Empty;
                if (_storage.TryRemove(usess, out val))
                {
                    //add new guy
                    _storage.TryAdd(usersessionid, items);

                    lock (_locker)
                    {
                        //remove LRU
                        _priority.RemoveFirst();
                        _priority.AddLast(usersessionid);
                    }
                }
            }
            else
            {

                if (_storage.TryAdd(usersessionid, items))
                {
                    lock (_locker)
                    {
                        _priority.AddLast(usersessionid);
                        _capacity--;
                    }
                }
            }

        }


    }
}