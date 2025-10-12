pipeline {
    agent any

    environment {
        LOCATION_IMAGE = 'it66070178/location:latest'
        PET_IMAGE      = 'it66070178/pet:latest'
        USER_IMAGE     = 'it66070178/user:latest'
        FRONTEND_IMAGE = 'it66070178/frontend:latest'
        DOCKER_CREDENTIALS = credentials('dockerhub')
        SUDO_PASSWORD = credentials('jenkins-sudo')
    }

    stages {
        stage('Start Jenkins') {
            steps {
                echo "🚀 Starting Jenkins Pipeline..."
                echo "Using DockerHub user: $DOCKER_CREDENTIALS_USR"
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    echo "$SUDO_PASSWORD" | sudo -S docker build -t $LOCATION_IMAGE ./location-service
                    echo "$SUDO_PASSWORD" | sudo -S docker build -t $PET_IMAGE ./pet-service
                    echo "$SUDO_PASSWORD" | sudo -S docker build -t $USER_IMAGE ./user-service
                    echo "$SUDO_PASSWORD" | sudo -S docker build -t $FRONTEND_IMAGE .
                '''
            }
        }

        stage('Push Docker Images') {
            steps {
                sh '''
                    echo "$DOCKER_CREDENTIALS_PSW" | docker login -u "$DOCKER_CREDENTIALS_USR" --password-stdin
                    docker push $LOCATION_IMAGE
                    docker push $PET_IMAGE
                    docker push $USER_IMAGE
                    docker push $FRONTEND_IMAGE
                    docker logout
                '''
            }
        }

        stage('Clean Old Containers') {
            steps {
                sh '''
                    echo "$SUDO_PASSWORD" | sudo -S docker ps -a -q --filter "name=pettrack-" | xargs -r sudo docker rm -f
                '''
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                sh '''
                    echo "$SUDO_PASSWORD" | sudo -S docker network rm express-network || true
                    echo "$SUDO_PASSWORD" | sudo -S docker compose down --remove-orphans
                    echo "$SUDO_PASSWORD" | sudo -S docker compose up -d --build
                '''
            }
        }

        stage('Clean Docker System') {
            steps {
                sh '''
                    echo "$SUDO_PASSWORD" | sudo -S docker container prune -f
                    echo "$SUDO_PASSWORD" | sudo -S docker image prune -f
                '''
            }
        }
    }

    post {
        always {
            echo "🧹 Cleaning up after build..."
            
                sh '''
                    echo "$SUDO_PASSWORD" | sudo -S docker logout || true
                '''
            
        }
    }
}
