if(path=window.location.pathname.split("/"),3==path.length){boards="",h=document.getElementsByClassName("ProfileBoardCard");for(var x=0;x<h.length;x++)cb=h[x].childNodes[0].href.split("/"),cb[cb.length-3]==path[1]&&(boards+=cb[cb.length-2]+",");boards=boards.substring(0,boards.length-1),location.href="https://www.pinpres.com"+window.location.pathname+boards}else 4==path.length?location.href="https://www.pinpres.com"+window.location.pathname:alert("Pinpres couldn't find a user or board. Please make sure you are on a user or board page");