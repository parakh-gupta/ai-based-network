#!/usr/bin/env python3
"""
Script to train Rasa NLU and Core models
"""

import subprocess
import os
import sys

def train_rasa_model():
    """Train Rasa NLU and Core models."""
    print("Starting Rasa model training...")
    print("-" * 50)
    
    try:
        # Train the model using Rasa train command
        result = subprocess.run(
            ['rasa', 'train', '--domain', 'domain.yml', '--data', 'data/', '--out', 'models/'],
            cwd=os.path.dirname(os.path.abspath(__file__)),
            capture_output=False
        )
        
        if result.returncode == 0:
            print("-" * 50)
            print("✓ Model training completed successfully!")
            print("The trained model is saved in the 'models/' directory.")
            return True
        else:
            print("-" * 50)
            print("✗ Model training failed with return code:", result.returncode)
            return False
    
    except FileNotFoundError:
        print("✗ Error: Rasa is not installed or not found in PATH")
        print("Please install Rasa using: pip install -r requirements.txt")
        return False
    except Exception as e:
        print(f"✗ Error during training: {str(e)}")
        return False

def validate_rasa_files():
    """Validate that all required Rasa files exist."""
    required_files = [
        'config.yml',
        'domain.yml',
        'data/nlu.yml',
        'data/rules.yml',
        'data/stories.yml'
    ]
    
    print("Validating Rasa configuration files...")
    print("-" * 50)
    
    all_exist = True
    for file_path in required_files:
        full_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), file_path)
        if os.path.exists(full_path):
            print(f"✓ Found: {file_path}")
        else:
            print(f"✗ Missing: {file_path}")
            all_exist = False
    
    print("-" * 50)
    return all_exist

if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("Rasa Model Training Script")
    print("=" * 50 + "\n")
    
    # Validate files first
    if not validate_rasa_files():
        print("\n✗ Some required files are missing. Please ensure all files are in place.")
        sys.exit(1)
    
    # Train the model
    if train_rasa_model():
        print("\n✓ Training complete! You can now use the chatbot.")
        sys.exit(0)
    else:
        print("\n✗ Training failed. Please check the error messages above.")
        sys.exit(1)
