import { BASE_URL } from "../utils/url";

export async function signin(values) {
  try {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-type": "application/json",
      },
      credentials: "include",
    });
    const userConnected = await response.json();
    // soit on récupère un utilisateur, soit un message
    return userConnected;
  } catch (error) {
    console.log(error);
  }
}

export async function signup(values) {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-type": "application/json",
      },
    });
    const message = await response.json();
    console.log(message);

    return message;
  } catch (error) {
    console.log(error);
  }
}

// méthodes update (même système que requête POST, seul le verbe change)

export async function update(values) {
  const user = {
    _id: values._id,
    email: values.email,
    nom: values.nom,
    localisation: values.localisation,
    bio: values.bio,
    styles: values.styles,
    portfolio: values.portfolio,
    followers: values.followers,

  };
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      method: "PUT",
      body: JSON.stringify(user),
      headers: {
        "Content-type": "application/json",
      },
    });
    const updatedUser = await response.json();

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}

export async function updateAvatar(values) {
  try {
    const response = await fetch(`${BASE_URL}/users/avatar`, {
      method: "PUT",
      body: JSON.stringify(values),
      headers: {
        "Content-type": "application/json",
      },
    });
    const updatedUserAvatar = await response.json();

    return updatedUserAvatar;
  } catch (error) {
    console.log(error);
  }
}

export async function getCurrentUser() {
  try {
    const response = await fetch(`${BASE_URL}/users/currentUser`, {
      method: "GET",
      credentials: "include",
    });
    if (response.ok) {
      return await response.json();
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function signOut() {
  await fetch(`${BASE_URL}/users/deleteToken`, {
    method: "DELETE",
    credentials: "include",
  });
}

export async function forgotPassword(values) {
  // console.log(values); { email: "john@test.fr"}
  try {
    const response = await fetch(`${BASE_URL}/users/forgotPassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    // retourne la réponse fournie par le serveur
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function resetPassword(values) {
  try {
    const response = await fetch(`${BASE_URL}/users/resetPassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function changePassword(values) {
  try {
    const response = await fetch(`${BASE_URL}/users/changePassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
      credentials:"include",
    });
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}
