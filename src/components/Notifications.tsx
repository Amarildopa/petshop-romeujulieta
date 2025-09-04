import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { Link } from 'react-router-dom';

interface Notification {
    id: string;
    title: string;
    message: string;
    createdAt: any; // Mantido como any para compatibilidade com o timestamp do Firebase
    isRead: boolean;
    link?: string;
}

export const Notifications: React.FC = () => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, "notificacoes"),
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.isRead).length);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleToggleOpen = () => {
        setIsOpen(!isOpen);
    };

    const handleMarkAllAsRead = async () => {
        if (!currentUser || unreadCount === 0) return;

        const batch = writeBatch(db);
        notifications.forEach(notif => {
            if (!notif.isRead) {
                const notifRef = doc(db, "notificacoes", notif.id);
                batch.update(notifRef, { isRead: true });
            }
        });
        await batch.commit();
    };

    return (
        <div className="relative">
            <button onClick={handleToggleOpen} className="relative p-2 rounded-full hover:bg-surface-dark text-text-color">
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-status-danger ring-2 ring-white"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-accent/20 z-20">
                    <div className="p-3 flex justify-between items-center">
                        <h3 className="font-semibold text-text-color-dark">Notificações</h3>
                        {unreadCount > 0 && 
                            <button onClick={handleMarkAllAsRead} className="text-sm text-primary hover:underline flex items-center">
                                <CheckCheck className="h-4 w-4 mr-1"/> Marcar todas como lidas
                            </button>
                        }
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <Link to={notif.link || '#'} key={notif.id} className={`block p-3 border-t border-accent/20 hover:bg-surface-dark ${!notif.isRead ? 'bg-primary-light/30' : ''}`}>
                                    <p className="font-semibold text-text-color-dark">{notif.title}</p>
                                    <p className="text-sm text-text-color">{notif.message}</p>
                                    <p className="text-xs text-text-color/70 mt-1">
                                        {new Date(notif.createdAt?.toDate()).toLocaleString('pt-BR')}
                                    </p>
                                </Link>
                            ))
                        ) : (
                            <p className="p-4 text-center text-sm text-text-color">Nenhuma notificação ainda.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
