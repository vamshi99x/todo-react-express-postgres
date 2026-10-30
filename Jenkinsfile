
pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-southeast-2'
        AWS_ACCOUNT_ID = '977468846243'
        ECR_REGISTRY = '977468846243.dkr.ecr.ap-southeast-2.amazonaws.com'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                sh '''
                    docker build \
                      -f backend/Dockerfile \
                      -t todo-backend:ci .
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                sh '''
                    docker build \
                      -f frontend/Dockerfile \
                      -t todo-frontend:ci .
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                    aws ecr get-login-password \
                      --region $AWS_REGION |
                    docker login \
                      --username AWS \
                      --password-stdin $ECR_REGISTRY
                '''
            }
        }

        stage('Push Backend to ECR') {
            steps {
                sh '''
                    docker tag todo-backend:ci \
                      $ECR_REGISTRY/todo-backend:latest

                    docker push \
                      $ECR_REGISTRY/todo-backend:latest
                '''
            }
        }

        stage('Push Frontend to ECR') {
            steps {
                sh '''
                    docker tag todo-frontend:ci \
                      $ECR_REGISTRY/todo-frontend:latest

                    docker push \
                      $ECR_REGISTRY/todo-frontend:latest
                '''
            }
        }
    }

    post {
        success {
            echo 'Both Docker images pushed successfully to Amazon ECR!'
        }
        failure {
            echo 'Pipeline failed. Check Console Output.'
        }
    }
}
