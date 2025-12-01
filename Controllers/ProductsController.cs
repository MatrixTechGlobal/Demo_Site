using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using eCommerce_Site.Models;

namespace eCommerce_Site.Controllers
{
    public class ProductsController: Controller
    {
        private readonly ILogger<HomeController> _logger;

        public ProductsController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult ProductCategoryList()
        {
            return View();
        }
        public IActionResult ProductDetails()
        {
            return View();
        }
        public IActionResult MyCart()
        {
            return View();
        }
        public IActionResult Checkout()
        {
            return View();
        }
    }
}
