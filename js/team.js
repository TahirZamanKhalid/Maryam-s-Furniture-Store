// Team page functionality

// Load team members when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadTeamMembers();
});

// Load team members from Firebase
async function loadTeamMembers() {
    const loadingContainer = document.getElementById('loadingContainer');
    const teamGrid = document.getElementById('teamGrid');
    const noTeam = document.getElementById('noTeam');

    try {
        if (typeof database === 'undefined') {
            throw new Error('Database not initialized');
        }

        // Get team members from Firebase
        const snapshot = await database.ref('team').orderByChild('order').once('value');
        const teamMembers = [];

        snapshot.forEach((childSnapshot) => {
            const member = childSnapshot.val();
            if (member.status === 'active') {
                teamMembers.push(member);
            }
        });

        // Hide loading
        loadingContainer.style.display = 'none';

        if (teamMembers.length === 0) {
            // Show no team message
            noTeam.style.display = 'block';
        } else {
            // Display team members
            teamGrid.style.display = 'grid';
            displayTeamMembers(teamMembers);
        }

    } catch (error) {
        console.error('Error loading team members:', error);
        loadingContainer.style.display = 'none';
        noTeam.style.display = 'block';
    }
}

// Display team members in grid
function displayTeamMembers(teamMembers) {
    const teamGrid = document.getElementById('teamGrid');
    teamGrid.innerHTML = '';

    teamMembers.forEach(member => {
        const card = createTeamCard(member);
        teamGrid.appendChild(card);
    });
}

// Create team member card
function createTeamCard(member) {
    const card = document.createElement('div');
    card.className = 'team-card';

    // Photo section
    const photoDiv = document.createElement('div');
    photoDiv.className = 'team-photo';

    if (member.photoURL && member.photoURL.trim() !== '') {
        const img = document.createElement('img');
        img.src = member.photoURL;
        img.alt = member.name;
        img.onerror = function() {
            // If image fails to load, show placeholder
            this.parentElement.innerHTML = '<i class="fas fa-user placeholder"></i>';
        };
        photoDiv.appendChild(img);
    } else {
        photoDiv.innerHTML = '<i class="fas fa-user placeholder"></i>';
    }

    // Info section
    const infoDiv = document.createElement('div');
    infoDiv.className = 'team-info';

    const name = document.createElement('div');
    name.className = 'team-name';
    name.textContent = member.name;

    const position = document.createElement('div');
    position.className = 'team-position';
    position.textContent = member.position;

    const bio = document.createElement('div');
    bio.className = 'team-bio';
    bio.textContent = member.bio || '';

    infoDiv.appendChild(name);
    infoDiv.appendChild(position);
    if (member.bio) {
        infoDiv.appendChild(bio);
    }

    // Social links
    if (member.socialLinks && (member.socialLinks.linkedin || member.socialLinks.twitter || member.socialLinks.email)) {
        const socialDiv = document.createElement('div');
        socialDiv.className = 'team-social';

        if (member.socialLinks.linkedin) {
            const linkedin = document.createElement('a');
            linkedin.href = member.socialLinks.linkedin;
            linkedin.target = '_blank';
            linkedin.innerHTML = '<i class="fab fa-linkedin"></i>';
            linkedin.title = 'LinkedIn';
            socialDiv.appendChild(linkedin);
        }

        if (member.socialLinks.twitter) {
            const twitter = document.createElement('a');
            twitter.href = member.socialLinks.twitter;
            twitter.target = '_blank';
            twitter.innerHTML = '<i class="fab fa-twitter"></i>';
            twitter.title = 'Twitter';
            socialDiv.appendChild(twitter);
        }

        if (member.socialLinks.email) {
            const email = document.createElement('a');
            email.href = `mailto:${member.socialLinks.email}`;
            email.innerHTML = '<i class="fas fa-envelope"></i>';
            email.title = 'Email';
            socialDiv.appendChild(email);
        }

        infoDiv.appendChild(socialDiv);
    }

    card.appendChild(photoDiv);
    card.appendChild(infoDiv);

    return card;
}
