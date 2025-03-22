const express = require('express');
const router = express.Router();
const { Notification, Examen, Matiere } = require('../models');
const { Op } = require('sequelize');

// Récupérer les notifications de l'utilisateur connecté
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { destinataireId: req.user.id },
      include: [{
        model: Examen,
        as: 'examen',
        include: [{
          model: Matiere,
          as: 'matiere'
        }]
      }],
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Marquer une notification comme lue
router.post('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    // Vérifier que la notification appartient bien à l'utilisateur
    if (notification.destinataireId !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    await notification.update({ read: true });
    
    const notificationComplete = await Notification.findByPk(notification.id, {
      include: [{
        model: Examen,
        as: 'examen',
        include: [{
          model: Matiere,
          as: 'matiere'
        }]
      }]
    });
    
    res.json(notificationComplete);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Marquer toutes les notifications comme lues
router.post('/read-all', async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      {
        where: {
          destinataireId: req.user.id,
          read: false
        }
      }
    );
    res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Supprimer une notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    // Vérifier que la notification appartient bien à l'utilisateur
    if (notification.destinataireId !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    await notification.destroy();
    res.json({ message: 'Notification supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 