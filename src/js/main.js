const scopes = [
    'user-read-private',
    'playlist-read-private',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-top-read',
    'user-library-read',
    'user-library-modify',
    'user-follow-read',
    'user-follow-modify'
]

const getEnvironment = () => {
    let host = '';
    if (location.host == '127.0.0.1:5500' || location.host == 'localhost:5500' ) {
        host = 'http://localhost:5500/josefigueroa.github.io/';
    } else {
        host = 'https://josefigueroa.github.io/';
    }

    return host;
}

const environment = getEnvironment();

const tinySlider = (element) => {
    var slider = tns({
        container: element,        
        mouseDrag: true,
        swipeAngle: false,
        speed: 400,
        controls: false,
        nav: false, 
        loop: false,
        autoHeight: false,
        edgePadding: 40,
        autoHeight: false,
        responsive: {
            320: {
                items: 2,
                gutter: 15,
            },
            640: {
                items: 3,
                gutter: 15,
            },
            768: {
                items: 4,
                gutter: 20,
            },
            1200: {
                items: 5,
                gutter: 20,
            }
        }
    });
}

const config = {
    clientId: '5e8ce1f91d3e42a5885116c9b3c44e3f',
    scopes: scopes.join(' '),
    redirect_uri: environment+'dist/templates/callback.html',
    base_url: 'https://api.spotify.com/v1/',
    auth_url: 'https://accounts.spotify.com/authorize'
}

const AUTHController = (function () {     
    const getLoginUrl = () => {
        window.open(
            config.auth_url+'?client_id='+config.clientId+'&response_type=token&redirect_uri='+config.redirect_uri+'&scope='+config.scopes+'&show_dialog=true', 
            'Login with Spotify', 
            'width=800,height=600'
        )
    }

    window.addEventListener("message", function (event) {
        var hash = JSON.parse(event.data);   
        var access_token = hash.access_token;
        if (access_token) {
            AUTHController.setAccessToken(access_token, hash.expires_in || 60);
            window.location.href = "top.html";
        }
    }, false);

    return {
        openLogin: () => {
            getLoginUrl();
        },

        getAccessToken: () =>{
            var expires = 0 + localStorage.getItem('expires', '0');
				if ((new Date()).getTime() > expires) {
					return '';
				}
				var token = localStorage.getItem('token', '');
				return token;
        },
        setAccessToken: function(token, expires_in) {
            localStorage.setItem('token', token);
            localStorage.setItem('expires', (new Date()).getTime() + expires_in);	
        },

        
    }    
})();

const APIController = (() =>{
    return {
        getMe: async () => {
            const response = await fetch(config.base_url+'me', {
                headers: {
                    'Authorization': 'Bearer ' + AUTHController.getAccessToken()
                }
            })
            const data = response.json();

            return data;
            
        },
        getSearch: async (query) => {
            let typePArams = {
                "type": "album,artist,playlist,track,show,episode"
            };
            // config.base_url+'search?q=' + query +'&' + (new URLSearchParams(typePArams)).toString()
            const response = await fetch(config.base_url+'search?q=' + query +'&' + (new URLSearchParams(typePArams)).toString(), {
                headers: {
                    'Authorization': 'Bearer ' + AUTHController.getAccessToken()
                }
            })
            const data = response.json();

            return data;
            
        },

        getArtist: async (id) => {
            const response = await fetch(`${config.base_url}artists/${id}`, {
                headers: {
                    'Authorization': 'Bearer ' + AUTHController.getAccessToken()
                }
            })
            const data = response.json();

            return data;
        },

        getTop: async(type, time_range = 'medium_term') => {
            const response = await fetch(`${config.base_url}me/top/${type}?time_range=${time_range}`, {
                headers: {
                    'Authorization': 'Bearer ' + AUTHController.getAccessToken()
                }
            })
            const data = response.json();

            return data;
        }
    }
})()

const APPController = (function () { 
    const getParamsURL = () => {
        let queryString = window.location.search;
        let urlParams = new URLSearchParams(queryString);
        let params = {};        

        urlParams.forEach((value, key) => {
            params[key] = value;
        });

        return params;
    }   

    const setBar = () => {
        var slider = document.getElementById("slider");
        var fill = document.querySelector(".bar .fill");
        if (fill) {
            fill.style.width = slider.value+'%';
            slider.addEventListener('input', setBar);
        }              
    }    
    const informationTab = () => {
        let desc = document.querySelector(".resume__desc");
        if(desc){
            let link = document.querySelector('a[href="#information"]');
            desc.addEventListener('click', function () {
                $(link).tab('show')
            });        
        }        
    }

    const scrollHeader = () => {       
        let scrollBody = document.querySelector('.main-view');
        
        scrollBody.addEventListener('scroll', function () {
            let fixHeader = document.querySelector('.header-nav'); 
            let top = document.querySelector('.main-view').scrollTop;
            
            if(top >= 10){
                fixHeader.classList.add('header-nav__sticky'); 
            }else{
               fixHeader.classList.remove('header-nav__sticky'); 
            } 
        })    
    }

    const login = () => {
        var logginButton = document.querySelector('#login');
        if(logginButton){
            logginButton.addEventListener("click", function () {               
                AUTHController.openLogin();
            })
        }
    }

    const printLogin = (data) =>{
        let dropdownLogin = document.querySelector('.login-dropdown');
        let imgLogin = document.querySelector('.login-dropdown__img img');
        let userLogin = document.querySelector('.login-dropdown__user');
        let src = '../../dist/images/nouser.png';

        dropdownLogin.classList.remove('d-none');
        imgLogin.src = (data.images.length > 0) ? data.images[0].url : src;
        userLogin.textContent = data.display_name;

    }
    const loadLoginFile = () => {
            let con = document.querySelector(".main-view");
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(e) {
                if(xhr.readyState == 4 && xhr.status == 200) {
                    con.innerHTML = xhr.responseText;
                    // document.querySelector('header').classList.add('d-none');
                    var logginButton = document.querySelector('#login');
                    if(logginButton){
                        logginButton.addEventListener("click", function () {               
                            AUTHController.openLogin();
                        })
                    }
                }
            }

            xhr.open("GET","login.html", true);
            xhr.setRequestHeader('Content-type', 'text/html');
            xhr.send();

    }

    const logout = () => {
        let logout = document.querySelector("#logout");
        if(logout){
            logout.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('expires');
            window.location.href = 'index.html';
        });
        }
        
    }

    const checkUser = () => {
        let token = AUTHController.getAccessToken();
        if(token){
            APIController.getMe()
                .then((data) => {
                    printLogin(data);
            })
        }else{
            loadLoginFile();
        }
        
    }

    const historyBack = () => {       
        let arrowLeft = document.querySelector('.header-nav__left');
        let arrowRight = document.querySelector('.header-nav__right');

        arrowLeft.addEventListener('click', function (e) {
            e.preventDefault();
            window.history.back();
        })

         arrowRight.addEventListener('click', function (e) {
            e.preventDefault();
            window.history.forward();
        })
    }

    const delay = (callback, ms) => {
        let timer = 0;
        return function() {
            let context = this, 
                args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                callback.apply(context, args);
            }, ms || 0);
        };
    }

    const searchResult = (data) => {
        let resultContent = document.querySelector('#searchModal .modal-body');
        var newSection = document.createElement("section");
        var newCardContent = document.createElement('div');
        var cardSection = newSection.appendChild(newCardContent);

        newCardContent.classList.add('card-content');
        resultContent.textContent = '';

        const getAlbums = (data) => {
            for (const albums of data.albums.items) {
            }
        }

        const getArtist = (data) => {
            resultContent.appendChild(cardSection)
            for (const artist of data.artists.items) {
                let markup = new Array();
                    html = `                    
                     <div class="card">
                        <img src="${artist.images.length ? artist.images[0].url : ` `}", alt=""/>
                        <div class="card-body">
                            <h5 class="card-title">
                                <a href="http://127.0.0.1:5500/josefigueroa.github.io/dist/templates/artist.html?id=${artist.id}" class="stretched-link">${artist.name}</a>
                            </h5> 
                        </div>
                    </div>
                `;
                markup.push(html);
                html = markup.join("");
                cardSection.innerHTML += html;                
            }
        }

        return {
            results () {
                getAlbums(data);
                getArtist(data);
            }
        }  
    }

    const searchQuery = () => {
        let searchDom  = document.querySelector('#search');
        if (searchDom) {
            searchDom.addEventListener('keyup', delay(function () {
                let q = this.value;
                if (q.length) {
                    APIController.getSearch(q)
                        .then((data) => { 
                            searchResult(data).results();                    
                    })
                }else{
                     document.querySelector('#searchModal .modal-body').textContent = '';
                }
                
            }, 900));
        }
        
    }

    const artistSheet = (data) => {
        let title = document.querySelector('.resume__title');
        let genre = document.querySelector('.resume__genre');
        let thumb = document.querySelector('.resume');

        title.textContent = data.name;
        thumb.style.backgroundImage = `linear-gradient(to bottom, rgba(29,30,50,0.3), #1d1e32),url(${data.images[0].url})`;

        for (const genreItem of data.genres) {
            let content = new Array();
            html = `<span class="resume__genre-items">${genreItem}</span>`

            content.push(html);
            html = content.join("");
            genre.innerHTML += html; 
        }
    }

    const artistData = () => {
        let params = getParamsURL();

        APIController.getArtist(params.id)
            .then((data) => {
                artistSheet(data);
            })
    }

    const printTopArtists = (data) => {
        let topArtistContent = document.querySelector('#topArtist .top-artists-slider');
        let topArtistGalleryBiggest = document.querySelector('#topArtistGallery .gallery__biggest');
        let topArtistOverlayTitle = document.querySelector('#topArtistGallery .gallery__title');
        let topArtistGallerySmallest = document.querySelector('#topArtistGallery .gallery_smallest');
        let imgGalleryBiggest = document.createElement("img");
        let dataItems = data.items;
        let topArtist = dataItems.slice(0,5);
        let artistData = dataItems.slice(5, data.items.length);        
        
        imgGalleryBiggest.src = dataItems[0].images[0].url;
        topArtistGalleryBiggest.appendChild(imgGalleryBiggest);
        topArtistOverlayTitle.innerHTML = `<a href="/josefigueroa.github.io/dist/templates/artist.html?id=${dataItems[0].id}">${dataItems[0].name}</a>`;
        topArtist.shift();

        for (const topArtistsItems of topArtist) {
            let content = new Array();
            html = `               
                <div class="gallery__items"> 
                    <img src="${topArtistsItems.images[0].url}" class="" alt="...">                    
                    <div class="gallery__overlay">
                        <h3 class="gallery__title">
                            <a href="/josefigueroa.github.io/dist/templates/artist.html?id=${topArtistsItems.id}">${topArtistsItems.name}</a>
                        </h3>
                        <p class="gallery__text"></p>
                    </div>                    
                </div>`;

            content.push(html);
            html = content.join("");
            topArtistGallerySmallest.innerHTML += html; 
        }
        
        for (const topArtists of artistData) {
            let content = new Array();
            html = `
                <div>
                    <div class="card">
                        <img src="${topArtists.images[0].url}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <a href="/josefigueroa.github.io/dist/templates/artist.html?id=${topArtists.id}" class="card-text stretched-link">${topArtists.name}</a>
                    </div>
                </div>`;

            content.push(html);
            html = content.join("");
            topArtistContent.innerHTML += html; 
        }
    }

    const topArtists = () => {
        APIController.getTop('artists')
            .then((data) => {                
                printTopArtists(data);
                tinySlider('.top-artists-slider');
            })
    }

    const printTopTracks = (data) => {
        let topTrackContent = document.querySelector('#topTracks .top-tracks-slider');
        let topTrackGalleryBiggest = document.querySelector('#topTracksGallery .gallery__biggest');
        let topTrackGallerySmallest = document.querySelector('#topTracksGallery .gallery_smallest');
        let topTrackOverlayTitle = document.querySelector('#topTracksGallery .gallery__title');
        let topTrackOverlayText = document.querySelector('#topTracksGallery .gallery__text');
        let imgGalleryBiggest = document.createElement("img");
        let dataItems = data.items;
        let topTrack = dataItems.slice(0,5);
        let trackData = dataItems.slice(5, data.items.length); 
                
        imgGalleryBiggest.src = dataItems[0].album.images[0].url;
        topTrackGalleryBiggest.appendChild(imgGalleryBiggest);
        topTrackOverlayTitle.innerHTML = `<a href="/josefigueroa.github.io/dist/templates/artist.html?id=${dataItems[0].artists[0].id}">${dataItems[0].artists[0].name}</a>`;
        topTrackOverlayText.textContent = `${dataItems[0].artists[0].name} - ${dataItems[0].album.name}`
        topTrack.shift();

        for (const topTracksItems of topTrack) {
            let content = new Array();
            html = `               
                <div class="gallery__items"> 
                    <img src="${topTracksItems.album.images[0].url}" class="" alt="...">
                    <div class="gallery__overlay">
                        <h3 class="gallery__title">
                            <a href="/josefigueroa.github.io/dist/templates/artist.html?id=${topTracksItems.artists[0].id}">${topTracksItems.artists[0].name}</a>
                        </h3>
                        <p class="gallery__text">${topTracksItems.name} - ${topTracksItems.album.name}</p>
                    </div>   
                </div>`;

            content.push(html);
            html = content.join("");
            topTrackGallerySmallest.innerHTML += html; 
        }       

        for (const topTracks of trackData) {
            let content = new Array();
            html = `
                <div>
                    <div class="card">
                        <img src="${topTracks.album.images[0].url}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <a href="/josefigueroa.github.io/dist/templates/artist.html?id=${topTracks.artists[0].id}" class="card-text stretched-link">${topTracks.artists[0].name}</a>
                    </div>
                </div>`;

            content.push(html);
            html = content.join("");
            topTrackContent.innerHTML += html; 
           
        }
    }

    const topTracks = () => {
        APIController.getTop('tracks')
            .then((data) => {                
                printTopTracks(data);
                tinySlider('.top-tracks-slider');
            })
    }


    return {
        init() {
            setBar();
            informationTab();
            scrollHeader();
            login();
            logout();
            checkUser();
            historyBack();
            searchQuery();
            artistData();
            topArtists();            
            topTracks();            
        }
    }    
})();

APPController.init();