pipeline {
    agent any

    environment {
       
        LOCATION_IMAGE = 'it66070178/location:latest'
        PET_IMAGE      = 'it66070178/pet:latest'
        USER_IMAGE     = 'it66070178/user:latest'
        FRONTEND_IMAGE = 'it66070178/frontend:latest'
        DOCKER_CREDENTIALS = credentials('dockerhub')
    }

    stages {
        stage('Start Jenkins') {
            steps {
                echo "Starting Jenkins Pipeline..."
                echo "Docker credentials user: $DOCKER_CREDENTIALS_USR"
            }
        }

        stage('Build Docker Images') {
            steps {
                dir('./location-service') {
                    echo "Building Location service image..."
                    sh 'docker build -t $LOCATION_IMAGE .'
                }
                dir('./pet-service') {
                    echo "Building Pet service image..."
                    sh 'docker build -t $PET_IMAGE .'
                }
                dir('./user-service') {
                    echo "Building User service image..."
                    sh 'docker build -t $USER_IMAGE .'
                }
                // dir('.') {
                //     echo "Building Frontend image..."
                //     sh 'docker build -t $FRONTEND_IMAGE .'
                // }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    echo "Logging in to Docker Hub..."
                    sh 'echo $DOCKER_CREDENTIALS_PSW | docker login --username $DOCKER_CREDENTIALS_USR --password-stdin'

                    echo "Pushing Location image..."
                    sh 'docker push $LOCATION_IMAGE'
                    echo "Pushing Pet image..."
                    sh 'docker push $PET_IMAGE'
                    echo "Pushing User image..."
                    sh 'docker push $USER_IMAGE'
                    // echo "Pushing Frontend image..."
                    // sh 'docker push $FRONTEND_IMAGE'
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                dir('.') {
                    echo "Stopping any running containers..."
                    sh 'docker compose down'
                    
                    echo "Starting services with docker-compose..."
                    sh 'docker compose up -d --build'
                }
            }
        }

        stage('Clean Docker') {
            steps {
                script {
                    echo "Cleaning unused Docker resources..."
                    sh 'docker system prune -af'
                }
            }
        }
    }

    post {
        always {
            echo "Logging out from Docker Hub..."
            sh 'docker logout'
        }
    }
}
