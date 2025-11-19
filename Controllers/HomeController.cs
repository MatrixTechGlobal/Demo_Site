using System.Diagnostics;
using eCommerce_Site.Models;
using Microsoft.AspNetCore.Mvc;

namespace eCommerce_Site.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }
       
        public IActionResult Login()
        {
            return View();
        }
        [HttpPost]
        public IActionResult Login(string pwd)
        {
            if(pwd=="64u2h5hnds")
            {
               return RedirectToAction("Index");
            }
            return View();
        }
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
