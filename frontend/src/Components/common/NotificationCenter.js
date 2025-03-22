import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Drawer, List, ListItem, ListItemText, Typography, Box, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      // // Connexion WebSocket
      // const ws = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://localhost:4500');
      // setSocket(ws);

      // ws.onmessage = (event) => {
      //   const notification = JSON.parse(event.data);
      //   setNotifications(prev => [notification, ...prev]);
      //   setUnreadCount(prev => prev + 1);
      // };

      // // Récupération des notifications existantes
      // fetchNotifications();

      // return () => {
      //   if (ws) {
      //     ws.close();
      //   }
      // };
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      // const response = await axios.get('/api/notifications', {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      // setNotifications(response.data);
      // setUnreadCount(response.data.filter(notif => !notif.read).length);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.post(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.post('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
      if (!notifications.find(notif => notif.id === notificationId)?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <IconButton
        color="inherit"
        onClick={() => setOpen(true)}
        sx={{ position: 'fixed', top: 20, right: 20 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Box sx={{ width: 350, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead}>
                Tout marquer comme lu
              </Button>
            )}
          </Box>

          <List>
            {notifications.length === 0 ? (
              <ListItem>
                <ListItemText primary="Aucune notification" />
              </ListItem>
            ) : (
              notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  <ListItemText
                    primary={notification.message}
                    secondary={new Date(notification.createdAt).toLocaleString()}
                  />
                  <Box>
                    {!notification.read && (
                      <Button
                        size="small"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Marquer comme lu
                      </Button>
                    )}
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(notification.id)}
                    >
                      Supprimer
                    </Button>
                  </Box>
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default NotificationCenter; 