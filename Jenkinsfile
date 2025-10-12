pipeline {
    agent any

    environment {
        LOCATION_IMAGE = 'it66070178/location:latest'
        PET_IMAGE      = 'it66070178/pet:latest'
        USER_IMAGE     = 'it66070178/user:latest'
        FRONTEND_IMAGE = 'it66070178/frontend:latest'
        DOCKER_CREDENTIALS = credentials('dockerhub')
        SUDO_PASSWORD = credentials('jenkins-sudo')  // ต้องสร้าง credentials เพิ่มใน Jenkins
    }

    stages {
        stage('Start Jenkins') {
            steps {
                echo "Starting Jenkins Pipeline..."
            }
        }

        stage('Build Docker Images') {
            steps {
                dir('./location-service') { sh 'echo $SUDO_PASSWORD | sudo -S docker build -t $LOCATION_IMAGE .' }
                dir('./pet-service') { sh 'echo $SUDO_PASSWORD | sudo -S docker build -t $PET_IMAGE .' }
                dir('./user-service') { sh 'echo $SUDO_PASSWORD | sudo -S docker build -t $USER_IMAGE .' }
                dir('.') { sh 'echo $SUDO_PASSWORD | sudo -S docker build -t $FRONTEND_IMAGE .' }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    sh '''
                    echo $SUDO_PASSWORD | sudo -S bash -c "
                        echo $DOCKER_CREDENTIALS_PSW | docker login --username $DOCKER_CREDENTIALS_USR --password-stdin &&
                        docker push $LOCATION_IMAGE &&
                        docker push $PET_IMAGE &&
                        docker push $USER_IMAGE &&
                        docker push $FRONTEND_IMAGE
                    "
                    '''
                }
            }
        }

        stage('Clean Old Containers') {
            steps {
                sh '''
                echo $SUDO_PASSWORD | sudo -S bash -c "
                    docker ps -a -q --filter name=pettrack- | xargs -r docker rm -f
                "
                '''
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                sh '''
                echo $SUDO_PASSWORD | sudo -S bash -c "
                    docker network rm express-network || true
                    docker compose down --remove-orphans
                    docker compose up -d --build
                "
                '''
            }
        }

        stage('Clean Docker System') {
            steps {
                sh 'echo $SUDO_PASSWORD | sudo -S docker system prune -f'
            }
        }
    }

    post {
        always {
            sh 'echo $SUDO_PASSWORD | sudo -S docker logout'
        }
    }
}
