using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using GROLIAAS.Repository;

namespace GROLIAAS.Models
{
    public class UserSession
    {
        public string SessionId { get; set; }
        public IEnumerable<GroliSectionModel> Selections { get; set; }

        public static string SaveNewSession(string items)
        {
            var sessionid = StringKey.New;
            //just in case
            while (DataStorage.ContainsKey(sessionid))
                sessionid = StringKey.New;

            DataStorage.Put(sessionid, items);
            return sessionid;
        }

        public static void SaveNewSession(string session, string items)
        {
            DataStorage.Update(session, items);

        }

        public static string GetSessionById(string sessionid)
        {
            return DataStorage.Get(sessionid);

        }
        public static UserSession GetMasterList()
        {
            return new UserSession
                {
                    Selections = GetStaticList()
                };
        }

        public string SelectionsJson
        {
            get { return new JavaScriptSerializer().Serialize(Selections); }
        }

        private static IEnumerable<GroliSectionModel> GetStaticList()
        {
            var sections = StaticFeed.Items.Split('#');
            return sections.Select(section => section.Split('|')).Select(category => new GroliSectionModel
                                                                                        {
                                                                                            SectionName = category[0],
                                                                                            Items = category[1].Split(',').Select(i => new GroliItemModel
                                                                                                {
                                                                                                    ItemDescription = i.Trim()
                                                                                                }).OrderBy(i => i.ItemDescription)
                                                                                        });
        }
    }
}