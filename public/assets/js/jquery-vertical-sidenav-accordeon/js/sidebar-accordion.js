$(document).ready(function(){$(".menu li:has(ul)").click(function(i){i.preventDefault(),$(this).hasClass("activado")?($(this).removeClass("activado"),$(this).children("ul").slideUp()):($(".menu li ul").slideUp(),$(".menu li").removeClass("activado"),$(this).addClass("activado"),$(this).children("ul").slideDown()),$(".menu li ul li a").click(function(){window.location.href=$(this).attr("href")})})});