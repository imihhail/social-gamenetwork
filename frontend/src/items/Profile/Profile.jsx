import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';

const backendUrl =
  import.meta.env.VITE_APP_BACKEND_PICTURE_URL || 'http://localhost:8080';

import { GetProfile } from '../../connections/profileConnection.js';
import { SendNewPrivacy } from '../../connections/newPrivacyConnection.js';

import styles from './Profile.module.css';

const Profile = () => {
  const [userProfile, setUserProfile] = useState('');
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [privacy, setPrivacy] = useState('');
  const [privacyButton, setPrivacyButton] = useState('');
  const navigate = useNavigate();
  const [modal, logout, sendJsonMessage] = useOutletContext();
  const location = useLocation()
  const currentUser = location.pathname.substring(9);
  const [ownProfile, setOwnProfile] = useState(false);
  const [alreadyFollowing, setAlreadyFollowing] = useState(false);

  useEffect(() => {
    modal(true);

    const formData = new FormData();
    formData.append('userId', currentUser);

    GetProfile(formData).then((data) => {
      if (data.login === 'success') {
        console.log("data: ", data);
        // profile info
        setUserProfile(data.profile)
        setFollowing(data.following);
        setFollowers(data.followers);
        setOwnProfile(data.ownProfile)
        setAlreadyFollowing(data.alreadyFollowing)
        // profile related posts
        setPosts(data.posts);
        if (currentUser.length === 0) {
          setPrivacy(data.profile.Privacy);
          setPrivacyButton("1")
        } else {
          setPrivacyButton("2")
        }
          modal(false);
      } else {
        logout();
      }
    });
  }, [navigate, modal, currentUser]);
  // Privacy settings change
  const handlePrivacyChange = () => {
    let newPrivacy = privacy === '1' ? '2' : '1';
    setPrivacy(newPrivacy);
    if (newPrivacy !== '1' && newPrivacy !== '2') {
      return;
    }
    const formData = new FormData();
    formData.append('privacy', newPrivacy);
    SendNewPrivacy(formData).then((data) => setPrivacy(data.SendNewPrivacy));
  };

  const followUser = (followUserId) => {
    sendJsonMessage({
      type: 'followUser',
      touser: followUserId,
    });
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profile}>
        {userProfile && userProfile.Privacy === "-1" ? (
          <p>This user is private, please send a follow request</p>
        ) : (
          <>
            <span>SOMEONE STYLE THIS PLEASE!</span>
            <div className={styles.avatar}>
              {userProfile.Avatar ? (
                <img
                  className={styles.avatarImg}
                  src={`${backendUrl}/avatar/${userProfile.Avatar}`}
                  alt='Avatar'
                ></img>
              ) : (
                ''
              )}
            </div>

            <span>Id: {userProfile.Id}</span>
            <span>Email: {userProfile.Email}</span>
            <span>First Name: {userProfile.FirstName}</span>
            <span>Last Name: {userProfile.LastName}</span>
            <span>Username: {userProfile.Username}</span>
            <span>
              Date of Birth: {new Date(userProfile.DateOfBirth).toDateString()}
            </span>
            {/* Logged in user's followers and following*/}
            <div className={styles.follow}>
              {following ? (
                <div>
                  <h2>Following</h2>
                  <ul>
                    {following.map((user, index) => (
                      <li key={index}>{user.SenderEmail}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No users are being followed.</p>
              )}

              {followers ? (
                <div>
                  <h2>Followers</h2>
                  <ul>
                    {followers.map((user, index) => (
                      <li key={index}>{user.SenderEmail}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No followers found.</p>
              )}
            </div>
          </>
        )}
        {/* Privacy settings */}
        {privacyButton === '1' && (
          <div>
            <span>Privacy mode: </span>
            <div className={styles.toggleSwitch}>
              <input
                type='checkbox'
                id='toggle'
                className={styles.toggleSwitchCheckbox}
                checked={privacy === '2'}
                onChange={handlePrivacyChange}
              />
              <label className={styles.toggleSwitchLabel} htmlFor='toggle'>
                <span className={styles.toggleSwitchInner} />
                <span className={styles.toggleSwitchSwitch} />
                <span
                  className={
                    privacy === '2'
                      ? styles.toggleSwitchTextOn
                      : styles.toggleSwitchTextOff
                  }
                >
                  {privacy === '2' ? 'ON' : 'OFF'}
                </span>
              </label>
            </div>
          </div>
        )}

        {ownProfile ? null : 
          (alreadyFollowing ? 
            <button onClick={() => unfollowUser(currentUser)}>Unfollow</button> :
            <button onClick={() => followUser(currentUser)}>Follow</button>
          )
        }

      </div>

      {/* Logged in user's posts */}
      <div className={styles.posts}>
        {posts && posts.length > 0 ? (
          <div>
            <h2>Posts</h2>
            <ul>
              {posts.map((post, index) => (
                <li key={index}>
                  <p>Id: {post.PostID}</p>
                  <p>Title: {post.Title}</p>
                  <p>Post: {post.Content}</p>
                  <p>Date: {post.Date}</p>
                  <p>Privacy: {post.Privacy}</p>
                  {post.Picture ? (
                    <img
                      className={styles.profilePostImg}
                      src={`${backendUrl}/avatar/${post.Picture}`}
                      alt='PostPicure'
                    ></img>
                  ) : (
                    ''
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No posts to show.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;