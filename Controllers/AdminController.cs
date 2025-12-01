using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace eCommerce_Site.Controllers
{
    public class AdminController : Controller
    {
     public IActionResult Admin()
        {
            return View();
        }
    }
}
