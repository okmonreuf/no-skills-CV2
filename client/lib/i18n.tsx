import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Locale = "fr" | "de";

export type Messages = typeof translations.fr;

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Messages;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const translations = {
  fr: {
    brand: "No-Skills Messagerie",
    heroTitle: "Contr��le total sur votre messagerie de communauté",
    heroDescription:
      "Gérez les accès, modérez les discussions et pilotez les événements dans un espace sécurisé et sobre en bleu et gris.",
    credentialsNotice:
      "Compte administrateur par défaut — à modifier immédiatement après la première connexion.",
    credentialsUser: "Identifiant : yupi",
    credentialsPassword: "Mot de passe : 1616Dh!dofly",
    loginTitle: "Connexion administrateur",
    usernameLabel: "Nom d'utilisateur",
    passwordLabel: "Mot de passe",
    loginButton: "Se connecter",
    loginHelper:
      "La création de comptes est réservée aux administrateurs. Pour toute demande, contactez l'équipe No-Skills.",
    securityTag: "Sûreté",
    securityChecklistTitle: "Sécurité intégrée",
    securityChecklist: [
      "Authentification chiffrée et audit en temps réel",
      "Création de comptes uniquement par les administrateurs",
      "Journalisation des actions sensibles (ban, mute, suppressions)",
      "Déploiement automatisé et HTTPS via Let's Encrypt",
    ],
    contactSupport: "Besoin d'aide ? support@no-skills.fr",
    languageToggle: {
      fr: "FR",
      de: "DE",
      label: "Langue",
    },
    loginError: "Impossible de se connecter. Vérifiez vos identifiants ou réessayez plus tard.",
    loginNetworkError: "Serveur injoignable. Merci de vérifier le déploiement.",
    continuePlaceholder: "Revenir à l'accueil",
    notFoundTitle: "Page introuvable",
    notFoundDescription:
      "Nous n'avons pas trouvé la page que vous recherchez. Utilisez la navigation principale pour poursuivre.",
    workspace: {
      header: {
        title: "Console de supervision",
        subtitle: "Supervisez vos salons et intervenez instantanément.",
        environmentLabel: "Environnement sécurisé",
        sessionLabel: "Session active",
        deployInfo: "Déployé via deploy.sh",
        signOut: "Déconnexion",
        onlineLabel: "Connectés",
      },
      navigation: {
        general: "Salon général",
        private: "Messages privés",
        admin: "Administration",
        banned: "Bannis",
        events: "Événements",
      },
      navigationDescriptions: {
        general: "Suivez le salon public et répondez rapidement.",
        private: "Initiez des discussions individuelles et contrôlez les permissions.",
        admin: "Créez des comptes, bannissez, mutez et consultez les logs.",
        banned: "Visualisez les comptes bannis et restaurez l'accès si nécessaire.",
        events: "Orchestrez les sessions tournantes avec des thèmes imposés.",
      },
      general: {
        title: "Salon général",
        subtitle: "Toutes les annonces et conversations publiques.",
        messagePlaceholder: "Écrire un message pour le salon général…",
        sendLabel: "Envoyer au salon",
        emptyState:
          "Aucun message pour le moment. Ouvrez la conversation avec une annonce de bienvenue.",
      },
      private: {
        title: "Messages privés",
        subtitle: "Sélectionnez un membre pour démarrer une discussion sécurisée.",
        searchPlaceholder: "Rechercher un utilisateur…",
        emptyUsers: "Aucun membre disponible.",
        noSelection: "Choisissez un membre dans la liste pour consulter l'historique.",
        messagePlaceholder: "Envoyer un message privé…",
        sendLabel: "Envoyer en privé",
        statusActive: "Utilisateur actif",
        statusMuted: "Utilisateur en sourdine",
        statusBanned: "Utilisateur banni",
      },
      admin: {
        createTitle: "Créer un compte",
        createDescription: "Générer un identifiant initial avant de transmettre les accès.",
        usernameLabel: "Nom d'utilisateur",
        displayNameLabel: "Nom d'affichage",
        passwordLabel: "Mot de passe temporaire",
        roleLabel: "Rôle",
        roleAdmin: "Administrateur",
        roleMember: "Membre",
        createButton: "Créer le compte",
        banTitle: "Bannir un utilisateur",
        banDescription: "Retirer immédiatement l'accès à la plateforme.",
        banPlaceholder: "Nom d'utilisateur à bannir",
        banButton: "Bannir",
        muteTitle: "Mettre en sourdine",
        muteDescription:
          "Suspendre la capacité d'envoyer des messages pendant une durée définie.",
        mutePlaceholder: "Nom d'utilisateur à mettre en sourdine",
        muteDurationLabel: "Durée (minutes)",
        muteButton: "Mettre en sourdine",
        logsTitle: "Journal d'audit",
        logsDescription: "Surveillez toutes les actions sensibles.",
        logsEmpty: "Aucune entrée pour le moment.",
        uploadTitle: "Photo de profil",
        uploadHelper:
          "Téléversez une image prise en charge (PNG ou JPG). Les administrateurs valident les avatars.",
        uploadButton: "Téléverser l'image",
        logMessages: {
          create: "{{actor}} a créé le compte {{target}}",
          ban: "{{actor}} a banni {{target}}",
          mute: "{{actor}} a mis {{target}} en sourdine pour {{duration}} min",
          unban: "{{actor}} a réhabilité {{target}}",
          upload: "{{actor}} a téléversé un avatar pour {{target}}",
          eventStart: "{{actor}} a lancé l'événement tournant",
          eventStop: "{{actor}} a clôturé l'événement tournant",
        },
        logLabels: {
          create: "Création",
          ban: "Ban",
          mute: "Mute",
          unban: "Réhabilitation",
          upload: "Média",
          eventStart: "Événement",
          eventStop: "Événement",
        },
      },
      banned: {
        title: "Utilisateurs bannis",
        subtitle: "Restaurez l'accès uniquement lorsque la communauté est prête.",
        empty: "Aucun utilisateur banni pour le moment.",
        unbanButton: "Réhabiliter",
      },
      events: {
        title: "Événement tournant",
        subtitle:
          "Organisez un échange en binômes de cinq minutes jusqu'à ce que tous se rencontrent.",
        themePlaceholder: "Ajouter un thème global…",
        addTheme: "Ajouter le thème",
        startButton: "Lancer l'événement",
        stopButton: "Clore l'événement",
        durationLabel: "Durée par rotation (minutes)",
        durationUnit: "minutes",
        scheduleTitle: "Programme des rotations",
        scheduleEmpty:
          "Ajoutez au moins deux participants actifs pour générer le programme.",
        activeTitle: "Événement en cours",
        activeDescription:
          "Les rotations sont générées automatiquement. Utilisez la liste pour guider les participants.",
        noThemes: "Ajoutez au moins un thème pour cadrer les discussions.",
        themesTitle: "Thèmes retenus",
        participantsTitle: "Participants actifs",
        roundLabel: "Tour",
        pairConnector: "avec",
        participantsEmpty: "Aucun participant actif.",
      },
      statuses: {
        admin: "Admin",
        member: "Membre",
        muted: "Muet",
        banned: "Banni",
      },
      feedback: {
        userCreated: "Compte créé avec succès.",
        userExists: "Ce nom d'utilisateur est déjà utilisé.",
        userBanned: "Utilisateur banni.",
        userNotFound: "Utilisateur introuvable.",
        userMuted: "Utilisateur mis en sourdine.",
        userUnbanned: "Utilisateur réhabilité.",
        mediaUploaded: "Image prête pour validation.",
        eventStarted: "Événement tournant lancé.",
        eventStopped: "Événement clôturé.",
        themeExists: "Ce thème est déjà présent.",
        themeAdded: "Thème ajouté.",
      },
    },
  },
  de: {
    brand: "No-Skills Messagerie",
    heroTitle: "Volle Kontrolle über eure Community-Messenger",
    heroDescription:
      "Verwalten Sie Zugänge, moderieren Sie Gespräche und steuern Sie Events in einer sicheren, grau-blauen Umgebung.",
    credentialsNotice:
      "Standard-Admin-Konto — bitte direkt nach dem ersten Login ändern.",
    credentialsUser: "Benutzername: yupi",
    credentialsPassword: "Passwort: 1616Dh!dofly",
    loginTitle: "Administrator-Anmeldung",
    usernameLabel: "Benutzername",
    passwordLabel: "Passwort",
    loginButton: "Anmelden",
    loginHelper:
      "Neue Konten werden ausschließlich durch Administratoren erstellt. Kontaktieren Sie das No-Skills-Team für Anfragen.",
    securityTag: "Sicherheit",
    securityChecklistTitle: "Integrierte Sicherheit",
    securityChecklist: [
      "Verschlüsselte Authentifizierung und Live-Audits",
      "Kontenerstellung ausschließlich durch Admins",
      "Protokollierung sensibler Aktionen (Ban, Mute, Löschungen)",
      "Automatisierte Bereitstellung und HTTPS via Let's Encrypt",
    ],
    contactSupport: "Hilfe benötigt? support@no-skills.fr",
    languageToggle: {
      fr: "FR",
      de: "DE",
      label: "Sprache",
    },
    loginError: "Anmeldung nicht möglich. Prüfen Sie Ihre Zugangsdaten oder versuchen Sie es später erneut.",
    loginNetworkError: "Server nicht erreichbar. Bitte Deployment prüfen.",
    continuePlaceholder: "Zur Startseite zurückkehren",
    notFoundTitle: "Seite nicht gefunden",
    notFoundDescription:
      "Wir konnten die gewünschte Seite nicht finden. Verwenden Sie die Hauptnavigation, um fortzufahren.",
    workspace: {
      header: {
        title: "Überwachungskonsole",
        subtitle: "Behalten Sie alle Kanäle im Blick und reagieren Sie sofort.",
        environmentLabel: "Gesicherte Umgebung",
        sessionLabel: "Aktive Sitzung",
        deployInfo: "Bereitgestellt via deploy.sh",
        signOut: "Abmelden",
        onlineLabel: "Online",
      },
      navigation: {
        general: "Allgemein",
        private: "Privat",
        admin: "Administration",
        banned: "Gesperrt",
        events: "Events",
      },
      navigationDescriptions: {
        general: "Verfolgen Sie den öffentlichen Kanal und antworten Sie in Echtzeit.",
        private: "Starten Sie Einzelgespräche und steuern Sie Berechtigungen.",
        admin: "Konten erstellen, sperren, stummschalten und Protokolle einsehen.",
        banned: "Gesperrte Konten einsehen und bei Bedarf reaktivieren.",
        events: "Organisieren Sie rotierende Sessions mit vorgegebenen Themen.",
      },
      general: {
        title: "Allgemeiner Kanal",
        subtitle: "Alle öffentlichen Ankündigungen und Unterhaltungen.",
        messagePlaceholder: "Nachricht für den allgemeinen Kanal schreiben…",
        sendLabel: "In den Kanal senden",
        emptyState:
          "Noch keine Nachrichten. Starten Sie die Unterhaltung mit einer Willkommensbotschaft.",
      },
      private: {
        title: "Private Nachrichten",
        subtitle: "Wählen Sie ein Mitglied, um einen geschützten Chat zu eröffnen.",
        searchPlaceholder: "Benutzer suchen…",
        emptyUsers: "Keine Mitglieder verfügbar.",
        noSelection: "Wählen Sie ein Mitglied auf der linken Seite, um den Verlauf zu sehen.",
        messagePlaceholder: "Private Nachricht senden…",
        sendLabel: "Privat senden",
        statusActive: "Aktiver Benutzer",
        statusMuted: "Benutzer stummgeschaltet",
        statusBanned: "Benutzer gesperrt",
      },
      admin: {
        createTitle: "Konto erstellen",
        createDescription: "Erstellen Sie Zugangsdaten, bevor Sie sie weitergeben.",
        usernameLabel: "Benutzername",
        displayNameLabel: "Anzeigename",
        passwordLabel: "Temporäres Passwort",
        roleLabel: "Rolle",
        roleAdmin: "Administrator",
        roleMember: "Mitglied",
        createButton: "Konto erstellen",
        banTitle: "Benutzer sperren",
        banDescription: "Der Zugriff wird sofort entfernt.",
        banPlaceholder: "Zu sperrender Benutzername",
        banButton: "Sperren",
        muteTitle: "Benutzer stummschalten",
        muteDescription:
          "Das Senden von Nachrichten für eine festgelegte Dauer deaktivieren.",
        mutePlaceholder: "Zu stummschaltender Benutzername",
        muteDurationLabel: "Dauer (Minuten)",
        muteButton: "Stummschalten",
        logsTitle: "Audit-Protokoll",
        logsDescription: "Überwachen Sie alle sensiblen Aktionen.",
        logsEmpty: "Noch keine Einträge.",
        uploadTitle: "Profilbild",
        uploadHelper:
          "Laden Sie ein unterstütztes Bild (PNG oder JPG) hoch. Administratoren geben Avatare frei.",
        uploadButton: "Bild hochladen",
        logMessages: {
          create: "{{actor}} hat das Konto {{target}} erstellt",
          ban: "{{actor}} hat {{target}} gesperrt",
          mute: "{{actor}} hat {{target}} für {{duration}} Min stummgeschaltet",
          unban: "{{actor}} hat {{target}} reaktiviert",
          upload: "{{actor}} hat ein Profilbild für {{target}} hochgeladen",
          eventStart: "{{actor}} hat das rotierende Event gestartet",
          eventStop: "{{actor}} hat das Event beendet",
        },
        logLabels: {
          create: "Erstellt",
          ban: "Sperre",
          mute: "Stumm",
          unban: "Reaktiviert",
          upload: "Upload",
          eventStart: "Event",
          eventStop: "Event",
        },
      },
      banned: {
        title: "Gesperrte Benutzer",
        subtitle:
          "Stellen Sie den Zugriff nur wieder her, wenn die Community bereit ist.",
        empty: "Derzeit sind keine Benutzer gesperrt.",
        unbanButton: "Reaktivieren",
      },
      events: {
        title: "Rotierendes Event",
        subtitle:
          "Organisieren Sie 5-Minuten-Gespräche in wechselnden Paaren, bis jeder mit jedem gesprochen hat.",
        themePlaceholder: "Globales Thema hinzufügen…",
        addTheme: "Thema hinzufügen",
        startButton: "Event starten",
        stopButton: "Event beenden",
        durationLabel: "Dauer pro Rotation (Minuten)",
        durationUnit: "Minuten",
        scheduleTitle: "Rotationsplan",
        scheduleEmpty:
          "Fügen Sie mindestens zwei aktive Teilnehmer hinzu, um einen Plan zu erstellen.",
        activeTitle: "Event läuft",
        activeDescription:
          "Die Rotationen werden automatisch erstellt. Nutzen Sie die Liste zur Moderation.",
        noThemes: "Fügen Sie mindestens ein Thema hinzu, um die Gespräche zu strukturieren.",
        themesTitle: "Themen",
        participantsTitle: "Aktive Teilnehmer",
        roundLabel: "Runde",
        pairConnector: "mit",
        participantsEmpty: "Keine aktiven Teilnehmer.",
      },
      statuses: {
        admin: "Admin",
        member: "Mitglied",
        muted: "Stumm",
        banned: "Gesperrt",
      },
      feedback: {
        userCreated: "Konto erfolgreich erstellt.",
        userExists: "Dieser Benutzername wird bereits verwendet.",
        userBanned: "Benutzer gesperrt.",
        userNotFound: "Benutzer nicht gefunden.",
        userMuted: "Benutzer stummgeschaltet.",
        userUnbanned: "Benutzer reaktiviert.",
        mediaUploaded: "Bild bereit zur Freigabe.",
        eventStarted: "Rotierendes Event gestartet.",
        eventStopped: "Event beendet.",
        themeExists: "Dieses Thema existiert bereits.",
        themeAdded: "Thema hinzugefügt.",
      },
    },
  },
};

export const LocaleProvider = ({
  initialLocale = "fr",
  children,
}: {
  initialLocale?: Locale;
  children: ReactNode;
}) => {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      messages: translations[locale],
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }

  return context;
};

export const availableLocales: Locale[] = ["fr", "de"];
