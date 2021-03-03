const scopes = [
    'user-read-private',
    'playlist-read-private',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-library-read',
    'user-library-modify',
    'user-follow-read',
    'user-follow-modify'
]

const config = {
    clientId: '5e8ce1f91d3e42a5885116c9b3c44e3f',
    scopes: scopes.join(' '),
    // redirect_uri: 'https://0bgqb.csb.app/',
    redirect_uri: 'http://localhost:5500/dist/templates/callback.html',
    base_url: 'https://api.spotify.com/v1/',
    auth_url: 'https://accounts.spotify.com/authorize'
}

const AUTHController = (function () { 
    if (location.host == 'http://localhost:5500') {
			config.redirect_uri = 'http://localhost:5500/dist/templates/callback.html';
		} else {
			config.redirect_uri = 'https://josefigueroa.github.io/dist/templates/callback.html';
		}
    
    const getLoginUrl = (callback) => {
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
            window.location.href = "artist.html";
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

        getMe: async () => {
            const response = await fetch(config.base_url+'me', {
                headers: {
                    'Authorization': 'Bearer ' + AUTHController.getAccessToken()
                }
            })
            const data = response.json();

            return data;
            
        }
    }    
})();

const APPController = (function () {      
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

        dropdownLogin.classList.remove('d-none');
        imgLogin.src = data.images[0].url;
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
            AUTHController.getMe()
                .then((data) => {                
                    console.log(data);
                    printLogin(data);
            })
        }else{
            loadLoginFile();
        }
        
    }

    return {
        init() {
            setBar();
            informationTab();
            scrollHeader();
            login();
            logout();
            checkUser();
        }
    }    
})();

APPController.init();