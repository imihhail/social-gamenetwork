package database

import (
	"backend/database/sqlite"
	"backend/helpers"
	"backend/structs"
	"database/sql"
	"fmt"
)

// get userid if email in table
func GetEmailIfExists(email string) bool {
	db := sqlite.DbConnection()
	var userId string
	command := "SELECT id FROM users WHERE email=?"
	err := db.QueryRow(command, email).Scan(&userId)
	if err != nil {
		if err != sql.ErrNoRows {
			helpers.CheckErr("GetEmailIfExists", err)
		}
		return false
	}
	defer db.Close()
	return true
}

// get userid if username in table
func GetUsernameIfExists(username string) bool {
	db := sqlite.DbConnection()
	var userId string
	command := "SELECT id FROM users WHERE username=?"
	err := db.QueryRow(command, username).Scan(&userId)
	if err != nil {
		if err != sql.ErrNoRows {
			helpers.CheckErr("GetUsernameIfExists", err)
		}
		return false
	}
	defer db.Close()
	return true
}

// get userid and password by email
func GetUserIdPswByEmail(email string) (string, string) {
	db := sqlite.DbConnection()
	var userId string
	var userPsw string
	command := "SELECT id, password FROM users WHERE email=?"
	err := db.QueryRow(command, email).Scan(&userId, &userPsw)
	if err != nil {
		if err != sql.ErrNoRows {
			helpers.CheckErr("GetUserIdPswByEmail", err)
		}
		return "0", "Email error"
	}
	defer db.Close()
	return userId, userPsw
}

// get userId session by hash from session table
func GetUserSession(cookie string) string {
	db := sqlite.DbConnection()
	command := "SELECT user_fk_users FROM session WHERE hash=?"
	err := db.QueryRow(command, cookie).Scan(&cookie)
	if err != nil {
		if err != sql.ErrNoRows {
			helpers.CheckErr("GetUserSession", err)
		}
		return "0"
	}
	defer db.Close()
	return cookie
}

func GetUserProfile(userId string) structs.Profile {
	db := sqlite.DbConnection()
	var userProfile structs.Profile
	command := "SELECT id, email, first_name, last_name, date_of_birth, username, about_user, avatar FROM users WHERE id=?"
	err := db.QueryRow(command, userId).Scan(&userProfile.Id,
		&userProfile.Email,
		&userProfile.FirstName,
		&userProfile.LastName,
		&userProfile.DateOfBirth,
		&userProfile.Username,
		&userProfile.AboutUser,
		&userProfile.Avatar)
	if err != nil {
		if err != sql.ErrNoRows {
			helpers.CheckErr("getUserProfile", err)
		}
		fmt.Println("User profile not found in users table!")
	}
	defer db.Close()
	return userProfile
}

func GetAllPosts() []structs.Posts {
	db := sqlite.DbConnection()
	defer db.Close()

	var allPosts []structs.Posts

	command := "SELECT posts.id, users.username, users.avatar, posts.post_Title, posts.post_content, posts.privacy_fk_posts_privacy, posts.date FROM posts INNER JOIN users ON posts.user_fk_users == users.id"
	rows, err := db.Query(command)
	if err != nil {
		helpers.CheckErr("getAllPosts", err)
		return nil
	}
	defer rows.Close()

	for rows.Next() {
		var post structs.Posts
		err = rows.Scan(&post.PostID, &post.Username, &post.Avatar, &post.Title, &post.Content, &post.Privacy, &post.Date)
		if err != nil {
			helpers.CheckErr("getAllPosts", err)
			continue
		}
		allPosts = append(allPosts, post)
	}

	if err = rows.Err(); err != nil {
		helpers.CheckErr("getAllPosts", err)
	}
	return allPosts
}

func GetAllUsers() []structs.Profile {
	db := sqlite.DbConnection()
	var allUsers []structs.Profile

	command := "SELECT id, username, email FROM users"
	rows, err := db.Query(command)
	if err != nil {
		helpers.CheckErr("getAllPosts", err)
		return nil
	}

	for rows.Next() {
		var user structs.Profile
		err = rows.Scan(&user.Id, &user.Username, &user.Email)
		if err != nil {
			helpers.CheckErr("getAllPosts", err)
			continue
		}
		allUsers = append(allUsers, user)
	}

	defer rows.Close()

	defer db.Close()
	return allUsers
}
