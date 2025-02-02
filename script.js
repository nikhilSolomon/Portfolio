$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
    
});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-fixed-top'
})

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});

// Intersection Observer for detecting when the section is in view
// Intersection Observer for detecting when the section is in view
document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-line'); // Add class when section is visible
            } else {
                entry.target.classList.remove('animate-line'); // Remove class when section is not visible
            }
        });
    }, { threshold: 0.5 }); // Trigger when 50% of the section is visible

    sections.forEach(section => {
        observer.observe(section); // Observe each section
    });
});


function _0x27a1(){const _0x32fbb5=['688738gKRxJY','log','1139680JXAxWg','reset','then','success','Failed\x20to\x20send\x20message','2458584LYmxMa','email','message','name','78kcBzfo','phone','service_u40spqf','24107625Nqqbxa','4kTVNsJ','1649127lJIiTu','358442FMmtes','addEventListener','template_0rth6rg','init','Message\x20sent\x20successfully','contactForm','Your\x20message\x20has\x20been\x20sent.\x20Thank\x20you!','Sorry,\x20there\x20was\x20an\x20error\x20sending\x20your\x20message.\x20Please\x20try\x20again.','8493936hqBlOg','send','5iiakQq4Jl5hFwOT_','getElementById','submit','value','innerHTML'];_0x27a1=function(){return _0x32fbb5;};return _0x27a1();}const _0x3814f0=_0x3f43;function _0x3f43(_0x76f3f8,_0x758ce){const _0x27a13f=_0x27a1();return _0x3f43=function(_0x3f4341,_0xe1733e){_0x3f4341=_0x3f4341-0xb0;let _0xdd9361=_0x27a13f[_0x3f4341];return _0xdd9361;},_0x3f43(_0x76f3f8,_0x758ce);}(function(_0x49195d,_0x35e1b3){const _0x17f64f=_0x3f43,_0x3f3598=_0x49195d();while(!![]){try{const _0x1dc9c5=parseInt(_0x17f64f(0xbd))/0x1+parseInt(_0x17f64f(0xc4))/0x2+-parseInt(_0x17f64f(0xcd))/0x3+parseInt(_0x17f64f(0xcc))/0x4*(parseInt(_0x17f64f(0xbf))/0x5)+-parseInt(_0x17f64f(0xc8))/0x6*(-parseInt(_0x17f64f(0xce))/0x7)+parseInt(_0x17f64f(0xb6))/0x8+-parseInt(_0x17f64f(0xcb))/0x9;if(_0x1dc9c5===_0x35e1b3)break;else _0x3f3598['push'](_0x3f3598['shift']());}catch(_0x3063d6){_0x3f3598['push'](_0x3f3598['shift']());}}}(_0x27a1,0x9d7bc),emailjs[_0x3814f0(0xb1)](_0x3814f0(0xb8)),document[_0x3814f0(0xb9)](_0x3814f0(0xb3))[_0x3814f0(0xcf)](_0x3814f0(0xba),function(_0x5e8c9f){const _0xdd6a46=_0x3814f0;_0x5e8c9f['preventDefault']();const _0x5ca12b=document['getElementById'](_0xdd6a46(0xc7))[_0xdd6a46(0xbb)],_0x4af883=document['getElementById'](_0xdd6a46(0xc5))[_0xdd6a46(0xbb)],_0x16fceb=document['getElementById'](_0xdd6a46(0xc9))[_0xdd6a46(0xbb)],_0x46088f=document[_0xdd6a46(0xb9)](_0xdd6a46(0xc6))['value'],_0x5d2f4a={'from_name':_0x5ca12b,'from_email':_0x4af883,'from_phone':_0x16fceb,'message':_0x46088f};emailjs[_0xdd6a46(0xb7)](_0xdd6a46(0xca),_0xdd6a46(0xb0),_0x5d2f4a)[_0xdd6a46(0xc1)](function(_0x560352){const _0xbdba6e=_0xdd6a46;console[_0xbdba6e(0xbe)](_0xbdba6e(0xb2),_0x560352),document['getElementById'](_0xbdba6e(0xc2))[_0xbdba6e(0xbc)]=_0xbdba6e(0xb4),document[_0xbdba6e(0xb9)](_0xbdba6e(0xb3))[_0xbdba6e(0xc0)]();},function(_0xd455ef){const _0x3f8cdd=_0xdd6a46;console[_0x3f8cdd(0xbe)](_0x3f8cdd(0xc3),_0xd455ef),document[_0x3f8cdd(0xb9)](_0x3f8cdd(0xc2))[_0x3f8cdd(0xbc)]=_0x3f8cdd(0xb5);});}));