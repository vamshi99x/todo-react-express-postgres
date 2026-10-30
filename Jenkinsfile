
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'release/0.0.2',
                    url: 'https://github.com/vamshi99x/todo-react-express-postgres.git'
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                sh 'docker build -f backend/Dockerfile -t todo-backend:ci .'
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh 'docker build -f frontend/Dockerfile -t todo-frontend:ci .'
            }
        }

        stage('Verify Docker Images') {
            steps {
                sh 'docker image inspect todo-backend:ci'
                sh 'docker image inspect todo-frontend:ci'
            }
        }

        stage('Prepare Database Volume') {
            steps {
                sh 'docker volume create todo-postgres-data'
            }
        }

        stage('Deploy Application') {
            steps {
                sh 'docker compose -p todo-react-express-postgres up -d --no-build'
            }
        }

        stage('Verify Deployment') {
            steps {
                sh 'docker compose -p todo-react-express-postgres ps'
                sh 'curl --fail --retry 5 --retry-delay 2 http://localhost:8083/'
            }
        }
    }

    post {
        success {
            echo 'Todo application deployed successfully on AWS EC2!'
        }
        failure {
            echo 'Deployment failed. Check Console Output.'
        }
    }
}
