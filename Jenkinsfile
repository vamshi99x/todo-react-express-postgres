
pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-southeast-2'
        AWS_ACCOUNT_ID = '977468846243'

        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        BACKEND_REPO = 'todo-backend'
        FRONTEND_REPO = 'todo-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
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
                sh 'docker build -f frontend/Dockerfile -t todo-frontend:ci --no-cache .'
            }
        }

        stage('Verify Docker Images') {
            steps {
                sh 'docker image inspect todo-backend:ci'
                sh 'docker image inspect todo-frontend:ci'
            }
        }

        stage('Authenticate with ECR') {
            steps {
                sh '''
                    aws ecr get-login-password --region $AWS_REGION |
                    docker login --username AWS --password-stdin $ECR_REGISTRY
                '''
            }
        }

        stage('Tag Docker Images') {
            steps {
                sh '''
                    docker tag todo-backend:ci \
                    $ECR_REGISTRY/$BACKEND_REPO:latest

                    docker tag todo-frontend:ci \
                    $ECR_REGISTRY/$FRONTEND_REPO:latest
                '''
            }
        }

        stage('Push Images to ECR') {
            steps {
                sh '''
                    docker push $ECR_REGISTRY/$BACKEND_REPO:latest
                    docker push $ECR_REGISTRY/$FRONTEND_REPO:latest
                '''
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
            echo 'Todo application built and pushed to ECR successfully!'
        }

        failure {
            echo 'Pipeline failed. Check Console Output.'
        }
    }
}
