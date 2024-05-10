import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';

const backendUrl =
  import.meta.env.VITE_APP_BACKEND_PICTURE_URL || 'http://localhost:8080';

import { GetPosts } from '../../connections/postsConnection.js';
import NewPost from './NewPost.jsx';
import { GetAllComments } from '../../connections/commentsConnection.js';
import NewComment from '../Comments/NewComment.jsx';

import styles from './Posts.module.css';

const Posts = () => {
  const [displayComments, setDisplayComments] = useState(false);
  const [displayTitle, setDisplayTitle] = useState('');
  const navigate = useNavigate();
  const [modal, logout, , lastMessage] = useOutletContext();
  const [allPosts, setAllPosts] = useState([]);

  useEffect(() => {
    showPosts();
  }, [navigate, modal]);

  useEffect(() => {
    if (lastMessage) {
      const messageData = JSON.parse(lastMessage.data);
      if (messageData.type == 'newPost') {
        showPosts();
      }
    }
  }, [lastMessage]);

  const showPosts = () => {
    modal(true);
    GetPosts().then((data) => {
      if (data.login === 'success') {
        setAllPosts(data.posts || []);
        modal(false);
      } else {
        logout();
      }
    });
    setDisplayComments(false);
    setDisplayTitle('');
  };

  const ShowComments = (
    post,
    setAllPosts,
    setDisplayComments,
    setDisplayTitle
  ) => {
    const formData = new FormData();
    formData.append('postID', post.PostID);

    GetAllComments(formData).then((data) =>
      data.comments == null ? setAllPosts([]) : setAllPosts(data.comments)
    );
    setDisplayTitle(post.Title);
    setDisplayComments(true);
  };

  return (
    <div className={styles.postsContainer}>
      {displayComments ? (
        <NewComment setAllPosts={setAllPosts} />
      ) : (
        <NewPost setAllPosts={setAllPosts} />
      )}

      <h1>{displayTitle}</h1>

      {allPosts &&
        allPosts.map((eachPost, index) => (
          <div
            className={styles.post}
            key={index}
            onClick={() =>
              ShowComments(
                eachPost,
                setAllPosts,
                setDisplayComments,
                setDisplayTitle
              )
            }
          >
            <h3>{eachPost.Title}</h3>
            <p>{eachPost.Content}</p>
            <Link to={`/profile/${eachPost.Email}`}>{eachPost.Email}</Link>
            <p>{eachPost.Username}</p>
            <p>{eachPost.Privacy}</p>
            <p>{eachPost.Date}</p>
            {eachPost.Avatar ? (
              <img
                className={styles.avatarImg}
                src={`${backendUrl}/avatar/${eachPost.Avatar}`}
                alt='Avatar'
              ></img>
            ) : (
              ''
            )}
            {eachPost.Picture ? (
              <img
                className={styles.avatarImg}
                src={`${backendUrl}/avatar/${eachPost.Picture}`}
                alt='PostPicure'
              ></img>
            ) : (
              ''
            )}
          </div>
        ))}
      {displayComments ? (
        <button onClick={showPosts}>RETURN TO POSTS</button>
      ) : (
        ''
      )}
    </div>
  );
};

export default Posts;
