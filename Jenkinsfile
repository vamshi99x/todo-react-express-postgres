
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Downloading source code from GitHub'
                checkout scm
            }
        }

        stage('Build Backend Image') {
            steps {
                sh '''
                    docker build \
                      -f backend/Dockerfile \
                      -t todo-backend:ci .
                '''
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh '''
                    docker build \
                      -f frontend/Dockerfile \
                      -t todo-frontend:ci .
                '''
            }
        }

        stage('Verify Images') {
            steps {
                sh 'docker images | grep todo-'
            }
        }
    }

    post {
        success {
            echo 'Both Docker images built successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the console output.'
        }
    }
}
