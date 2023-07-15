const { Client } = Appwrite;
const client = new Client();
const signupForm = document.querySelector('#signUpForm')
const loginForm = document.querySelector('#loginForm')
const sellForm = document.querySelector('#sellForm')
const products = document.querySelector('#products')
const loginDialog = document.querySelector('#loginDialog')
const signupDialog = document.querySelector('#signupDialog')
const userDetails = document.querySelector('#userDetails')

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('647cb04047acf20fd97e')

const account = new Appwrite.Account(client);
const databases = new Appwrite.Databases(client);
const storage = new Appwrite.Storage(client);

const authHandler = async () => {
    const user = await account.get()
    if (user) {
        document.querySelector('.auth-btn-wrapper') && (document.querySelector('.auth-btn-wrapper').style.display = "none")
        const profileLink = document.createElement('a')
        profileLink.id = 'profileLink'
        profileLink.className = 'btn btn-success btn-sm md:btn-md'
        profileLink.href = 'profile.html'
        profileLink.innerHTML = 'My Profile'
        document.querySelector('.navbar-end')?.append(profileLink)
        const logoutBtn = document.createElement('button')
        logoutBtn.id = 'logoutBtn'
        logoutBtn.className = 'btn btn-error btn-sm md:btn-md'
        logoutBtn.innerHTML = 'Logout'
        logoutBtn.addEventListener('click', logout)
        document.querySelector('.navbar-end')?.append(logoutBtn)

    } else {
        document.querySelector('.auth-btn-wrapper') && (document.querySelector('.auth-btn-wrapper').style.display = "flex")
        document.querySelector('#profileLink')?.remove()
        document.querySelector('#logoutBtn')?.removeEventListener('click', logout)
        document.querySelector('#logoutBtn')?.remove()
    }
}

const logout = async() => {
    account.deleteSession('current').then(r=>location.reload()).catch(e=>console.log(e))
    authHandler()
}

const populateProducts = async () => {
    databases.listDocuments('647ccc20de47586cb1ca', '647ccc34d88785a2d052', []).then(res => {
        products.innerHTML = Array.from(res.documents).map(v => {
            return ` <div class="max-w-sm w-full card shadow-2xl m-5 bg-base-100 justify-center items-center overflow-hidden">
            <div class="h-[30vh] overflow-hidden flex items-center justify-center">
              <img src="${v.photo}" alt="${v.category}" class="w-full  ">
              </div>
            <div class="card-body w-full">
              <h2 class="card-title">${v.category}</h2>
              <div class="text-xl">₹ ${v.price}</div>
              <p>${v.description}</p>
              <small>Seller: ${v.name}</small>
              <div class="card-actions  mt-2 w-full">
              ${localStorage["cookieFallback"] ? `<a href="https://wa.me/91${v.phone}?text=Hi, I am interested in buying ${v.category} (${v.description})." class="btn shadow-lg btn-success w-full">BUY NOW</a>` : '<a class="btn btn-error w-full" href="index.html">Login To Buy</a>'}
              </div>
            </div>
          </div>`
        })
    }).catch(err => console.log(err))
}

const deleteProduct = async (e) => {
    if (e.target.className.includes('profile-product-btn')) {
        console.log()
        databases.deleteDocument('647ccc20de47586cb1ca', '647ccc34d88785a2d052', e.target.dataset.id).then(res => {
            storage.deleteFile('647ccd6f57d834a0b8eb', e.target.dataset.imageid);
        }).then(() => location.reload()).catch(er => console.log(er))
    }
}

const populateUserDetails = async () => {
    account.get().then(async (user) => {
        const data = await databases.listDocuments('647ccc20de47586cb1ca', '647ccc34d88785a2d052', [
            Appwrite.Query.equal('userid', user.$id)
        ])
        userDetails && (userDetails.innerHTML = `
        <div class="flex flex-col gap-4 bg-base-100 rounded-box p-6">
    <small>Email</small>
    <h1 class='text-xl'>${user.email}</h1>
    <small>Account created</small>
    <h1 class='text-xl'>${user.$createdAt.split('T')[0]}</h1>
    </div>
    <div class="flex flex-col gap-4 flex-1 bg-base-100 rounded-box p-4">
        <h1 class="text-3xl mx-auto">Listed Products</h1>
        <div class = "flex flex-wrap w-full">
        ${Array.from(data.documents).map((v) => {
            return ` <div class="max-w-xs w-full card shadow-2xl m-5 bg-base-100 justify-center items-center overflow-hidden">
            <div class="h-[30vh] overflow-hidden flex items-center justify-center">
              <img src="${v.photo}" alt="${v.category}" class="w-full  ">
              </div>
            <div class="card-body w-full">
              <h2 class="card-title">${v.category}</h2>
              <div class="text-xl">₹ ${v.price}</div>
              <p>${v.description}</p>
              <small>Seller: ${v.name}</small>
              <button data-imageid=${v.photo.split("/files/")[1].split("/")[0]} data-id="${v.$id}" class="profile-product-btn btn btn-error btn-sm md:btn-md">Delete</button>
            </div>
          </div>`
        })}
        </div>
    </div>
    `)
    }
    ).catch(err => console.log(err))
}

document.addEventListener('click', deleteProduct)

signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!signupForm.querySelector('#email').value.includes('@vitstudent.ac.in')) {
        alert('Enter Valid VIT Email Address')
        return
    }
    if (signupForm.querySelector('#password').length < 8) {
        alert('The password should be atleast 8 characters')
        return
    }
    account.create(
        Appwrite.ID.unique(),
        signupForm.querySelector('#email').value,
        signupForm.querySelector('#password').value
    ).then(r => {
        localStorage['user'] = JSON.stringify(r)
        alert("Created Account successfully")
        signupDialog.close()
    }).then(() => {
        setTimeout(authHandler, 500)
    }).catch((error) => {
        console.log(error)
        alert('Seems like you already have an account. Login Instead')
        signupDialog.close()
    })
})
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!loginForm.querySelector('#email').value.includes('@vitstudent.ac.in')) {
        alert('Enter Valid VIT Email Address')
        return
    }
    if (loginForm.querySelector('#password').length < 8) {
        alert('The password should be atleast 8 characters')
        return
    }
    account.createEmailSession(
        loginForm.querySelector('#email').value,
        loginForm.querySelector('#password').value
    ).then(r => {
        localStorage['user'] = JSON.stringify(r);
        alert('Logged in successfully')
        loginDialog.close()
    }).then(() => {
        setTimeout(authHandler, 500)
    }).catch((error) => {
        console.log(error)
        alert('Invalid credentials')
        loginDialog.close()
    })
})

sellForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const inputIds = ["desc", "price", "username", "phone"]
    const [description, price, name, phone] = inputIds.map((v) => {
        return document.querySelector('#' + v).value
    })
    if (+price <= 0) {
        alert('Price can\'t be negative')
        return
    }
    if (!phone.match(/^[6-9]{1}[0-9]{9}$/)) {
        alert('Please enter a valid number')
        return
    }

    const category = document.querySelector('input[name="radio-10"]:checked').value;
    const photoFile = document.querySelector('#photo').files[0]
    const user = await account.get()
    if(!user){
        alert('You must be logged in to list your product')
        location.href = '/'
    }
    storage.createFile('647ccd6f57d834a0b8eb', Appwrite.ID.unique(), photoFile).then((response) => {
        const photo = `https://cloud.appwrite.io/v1/storage/buckets/647ccd6f57d834a0b8eb/files/${response.$id}/view?project=647cb04047acf20fd97e`
        databases.createDocument('647ccc20de47586cb1ca', '647ccc34d88785a2d052',
            Appwrite.ID.unique(),
            {
                category,
                photo,
                description,
                price,
                name,
                phone,
                userid: user.$id
            }
        )
    }).then(() => {
        alert('Successfully added product')
        window.location = '/'
    }).catch((error) => {
        console.log(error);
    });
})

products && populateProducts()
authHandler()
localStorage['theme'] && document.querySelector('html').setAttribute("data-theme", localStorage['theme'].toLowerCase());

loginDialog?.addEventListener('click', function (event) {
    var rect = loginDialog.getBoundingClientRect();
    var isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height
        && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
    if (!isInDialog) {
        loginDialog.close();
    }
});
signupDialog?.addEventListener('click', function (event) {
    var rect = signupDialog.getBoundingClientRect();
    var isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height
        && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
    if (!isInDialog) {
        signupDialog.close();
    }
});

populateUserDetails()

const themes = ["Light", "Dark", "Cupcake", "Bumblebee", "Emerald", "Corporate", "Synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"];
let currentThemeIndex = 0; // Index of the initial theme

const themeToggleBtn = document.getElementById("themeToggle");
const htmlElement = document.querySelector("html");

themeToggleBtn.addEventListener("click", () => {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex];
    htmlElement.setAttribute("data-theme", newTheme.toLowerCase());
    localStorage['theme'] = newTheme
});