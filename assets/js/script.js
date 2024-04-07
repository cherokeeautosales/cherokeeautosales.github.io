
// JavaScript for Navbar Toggle and Active Navigation Item
const navToggler = document.querySelector(".nav-toggler");
   navToggler.addEventListener("click", navToggle);

   function navToggle() {
      navToggler.classList.toggle("active");
      const nav = document.querySelector(".nav");
      nav.classList.toggle("open");
      if (nav.classList.contains("open")) {
         nav.style.maxHeight = nav.scrollHeight + "px";
      } else {
         nav.removeAttribute("style");
      }
   }


// JavaScript to make the navbar sticky

const header = document.querySelector(".header");
const headerHeight = header.offsetHeight;

window.addEventListener("scroll", () => {
   if (window.scrollY > headerHeight) {
      header.classList.add("sticky");
   } else {
      header.classList.remove("sticky");
   }
});

// review
 var swiper = new Swiper(".slide-container", {
   slidesPerView: 4,
   spaceBetween: 20,
   sliderPerGroup: 4,
   loop: true,
   centerSlide: "true",
   fade: "true",
   grabCursor: "true",
   pagination: {
     el: ".swiper-pagination",
     clickable: true,
     dynamicBullets: true,
   },
   autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
   navigation: {
     nextEl: ".swiper-button-next",
     prevEl: ".swiper-button-prev",
   },
 
   breakpoints: {
     0: {
       slidesPerView: 1,
     },
     520: {
       slidesPerView: 2,
     },
     768: {
       slidesPerView: 3,
     },
     1000: {
       slidesPerView: 4,
     },
   },
 });
//  faq
document.addEventListener("DOMContentLoaded", function() {
   const accordionItems = document.querySelectorAll('.accordion-item');

   accordionItems.forEach(item => {
     item.addEventListener('click', () => {
       accordionItems.forEach(otherItem => {
         if (otherItem !== item) {
           otherItem.classList.remove('active');
         }
       });
       item.classList.toggle('active');
     });
   });
 });

