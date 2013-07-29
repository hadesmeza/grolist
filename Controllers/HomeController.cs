using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using GROLIAAS.Models;
using GROLIAAS.Repository;

namespace GROLIAAS.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index(string id)
        {
            if (!String.IsNullOrWhiteSpace(id))
            {
                var model = UserSession.GetSessionById(id);
                if (model == null) return RedirectToAction("Index", "Home", new {id = string.Empty});
                ViewData["sessionid"] = id;
                return View((object)model);
            }

            return View(string.Empty);
        }

        [HttpPost]
        public JsonResult GetMasterList()
        {
            return Json(UserSession.GetMasterList().Selections);
        }

        [HttpPost]
        public JsonResult SaveSession(string selections, string session)
        {
            if (!string.IsNullOrWhiteSpace(session))
            {
                UserSession.SaveNewSession(session, selections);
                return Json(new { sessionid = session });
            }

            try
            {
                session = UserSession.SaveNewSession(selections);
            }
            catch (Exception ex)
            {
                session = UserSession.SaveNewSession(selections);
            }


            return Json(new { sessionid = session });
        }

    }
}