"""
AutoGLM-Phone Integration for FraudGuard HK
============================================

This module provides the autonomous phone agent functionality using AutoGLM-Phone.

Requirements:
    pip install transformers torch pillow

For GPU acceleration:
    pip install transformers torch pillow accelerate

Usage:
    from autoglm_phone import AutoGLMAgent
    
    agent = AutoGLMAgent()
    result = agent.analyze_screen(
        image_path="screenshot.png",
        instruction="Check for suspicious messages"
    )
"""

import base64
import json
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from enum import Enum


class ActionType(Enum):
    OPEN_APP = "open_app"
    CHECK_MESSAGES = "check_messages"
    ANALYZE_SCREEN = "analyze_screen"
    MAKE_CALL = "make_call"
    SEND_MESSAGE = "send_message"
    SEARCH_WEB = "search_web"
    NONE = "none"


@dataclass
class AgentAction:
    type: ActionType
    app_name: Optional[str] = None
    description: str = ""
    params: Optional[Dict[str, Any]] = None
    coordinates: Optional[List[List[int]]] = None  # For UI grounding: [[xmin, ymin, xmax, ymax]]


@dataclass
class AgentPlan:
    intent: str
    action: AgentAction
    confidence: float
    requires_confirmation: bool
    speak_response: str


class AutoGLMAgent:
    """
    AutoGLM-Phone agent for autonomous phone interactions.
    
    This uses the zai-org/AutoGLM-Phone-9B-Multilingual model for:
    - Understanding phone UI screenshots
    - Grounding UI elements (finding coordinates)
    - Planning actions on phone interface
    """
    
    def __init__(self, model_path: str = "zai-org/AutoGLM-Phone-9B-Multilingual", device: str = "auto"):
        """
        Initialize the AutoGLM-Phone agent.
        
        Args:
            model_path: HuggingFace model path
            device: Device to run on ('auto', 'cuda', 'cpu', 'mps')
        """
        self.model_path = model_path
        self.device = device
        self.processor = None
        self.model = None
        self._initialized = False
    
    def _lazy_init(self):
        """Lazy initialization - only load model when needed."""
        if self._initialized:
            return
            
        try:
            from transformers import AutoProcessor, AutoModelForImageTextToText
            import torch
            
            print(f"Loading AutoGLM-Phone model from {self.model_path}...")
            
            self.processor = AutoProcessor.from_pretrained(self.model_path)
            self.model = AutoModelForImageTextToText.from_pretrained(
                self.model_path,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map=self.device
            )
            
            self._initialized = True
            print("AutoGLM-Phone model loaded successfully!")
            
        except ImportError as e:
            raise ImportError(
                "AutoGLM-Phone requires transformers and torch.\n"
                "Install with: pip install transformers torch pillow accelerate"
            ) from e
    
    def analyze_screen(
        self,
        image_source: str,
        instruction: str,
        max_new_tokens: int = 256
    ) -> AgentPlan:
        """
        Analyze a phone screen and plan an action.
        
        Args:
            image_source: Path to image file, URL, or base64 data URL
            instruction: What the user wants to do
            max_new_tokens: Maximum tokens to generate
            
        Returns:
            AgentPlan with action details
        """
        self._lazy_init()
        
        # Handle different image sources
        if image_source.startswith('data:image'):
            # Base64 data URL - save temporarily or handle directly
            image_url = image_source
        elif image_source.startswith('http'):
            # URL
            image_url = image_source
        else:
            # Local file path
            image_url = f"file://{image_source}"
        
        # Build messages for AutoGLM-Phone
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image", "url": image_url},
                    {"type": "text", "text": instruction}
                ]
            }
        ]
        
        # Process with AutoGLM-Phone
        inputs = self.processor.apply_chat_template(
            messages,
            add_generation_prompt=True,
            tokenize=True,
            return_dict=True,
            return_tensors="pt"
        ).to(self.model.device)
        
        # Generate response
        outputs = self.model.generate(**inputs, max_new_tokens=max_new_tokens)
        response_text = self.processor.decode(
            outputs[0][inputs["input_ids"].shape[-1]:],
            skip_special_tokens=True
        )
        
        # Parse response into AgentPlan
        return self._parse_response(instruction, response_text)
    
    def find_ui_element(
        self,
        image_source: str,
        element_description: str
    ) -> Optional[List[List[int]]]:
        """
        Find UI element coordinates on screen.
        
        Args:
            image_source: Path to screenshot
            element_description: Description of element to find
            
        Returns:
            List of bounding boxes [[xmin, ymin, xmax, ymax], ...] or None
        """
        prompt = f"Find the {element_description}. Provide coordinates in [[xmin,ymin,xmax,ymax]] format."
        
        plan = self.analyze_screen(image_source, prompt)
        
        if plan.action.coordinates:
            return plan.action.coordinates
        
        # Try to extract coordinates from response
        import re
        response_text = plan.speak_response
        coord_match = re.findall(r'\[\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\]', response_text)
        
        if coord_match:
            return [[int(x) for x in match] for match in coord_match]
        
        return None
    
    def _parse_response(self, instruction: str, response: str) -> AgentPlan:
        """Parse AutoGLM-Phone response into structured plan."""
        
        # Try to extract JSON from response
        try:
            json_match = json.loads(response) if '{' in response else None
            if json_match:
                return AgentPlan(
                    intent=json_match.get('intent', instruction),
                    action=AgentAction(
                        type=ActionType(json_match.get('action', 'none')),
                        description=json_match.get('description', ''),
                        coordinates=json_match.get('coordinates')
                    ),
                    confidence=json_match.get('confidence', 0.8),
                    requires_confirmation=json_match.get('requires_confirmation', True),
                    speak_response=json_match.get('speak_response', response)
                )
        except (json.JSONDecodeError, ValueError):
            pass
        
        # Parse action type from text
        response_lower = response.lower()
        
        if any(word in response_lower for word in ['open', '打開', '启动', 'launch']):
            action_type = ActionType.OPEN_APP
        elif any(word in response_lower for word in ['check', '檢查', '检查', 'analyze']):
            action_type = ActionType.CHECK_MESSAGES
        elif any(word in response_lower for word in ['call', '打電話', '拨打', 'dial']):
            action_type = ActionType.MAKE_CALL
        elif any(word in response_lower for word in ['send', '發送', '发送', 'message']):
            action_type = ActionType.SEND_MESSAGE
        elif any(word in response_lower for word in ['tap', 'click', '點擊', '点击']):
            action_type = ActionType.ANALYZE_SCREEN
        else:
            action_type = ActionType.NONE
        
        return AgentPlan(
            intent=instruction,
            action=AgentAction(
                type=action_type,
                description=response[:200]
            ),
            confidence=0.7,
            requires_confirmation=True,
            speak_response=response
        )


class GLM46VisionClient:
    """
    Client for GLM-4.6V with grounding support.
    Uses the zai-sdk for Python.
    
    Installation:
        pip install zai-sdk
    
    Usage:
        client = GLM46VisionClient(api_key="your_key")
        result = client.analyze_image(image_url, "What's in this image?")
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self._client = None
    
    def _lazy_init(self):
        if self._client:
            return
        
        try:
            from zai import ZhipuAiClient
            self._client = ZhipuAiClient(api_key=self.api_key)
        except ImportError:
            raise ImportError(
                "GLM-4.6V client requires zai-sdk.\n"
                "Install with: pip install zai-sdk"
            )
    
    def analyze_image(
        self,
        image_url: str,
        question: str,
        with_grounding: bool = False
    ) -> Dict[str, Any]:
        """
        Analyze an image with GLM-4.6V.
        
        Args:
            image_url: URL or base64 data URL of image
            question: Question about the image
            with_grounding: Whether to request bounding box coordinates
            
        Returns:
            Dict with 'text' and optionally 'coordinates'
        """
        self._lazy_init()
        
        prompt = question
        if with_grounding:
            prompt += " Provide coordinates in [[xmin,ymin,xmax,ymax]] format."
        
        messages = [
            {
                "content": [
                    {"type": "image_url", "image_url": {"url": image_url}},
                    {"type": "text", "text": prompt}
                ],
                "role": "user"
            }
        ]
        
        response = self._client.chat.completions.create(
            model="glm-4.6v",
            messages=messages,
            thinking={"type": "enabled"}
        )
        
        text = response.choices[0].message.content
        
        # Extract coordinates if present
        coordinates = None
        if with_grounding:
            import re
            coord_match = re.findall(r'\[\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\]', text)
            if coord_match:
                coordinates = [[int(x) for x in match] for match in coord_match]
        
        return {
            "text": text,
            "coordinates": coordinates,
            "model": "glm-4.6v"
        }


# Convenience function for quick usage
def analyze_phone_screen(image_path: str, instruction: str) -> AgentPlan:
    """
    Quick function to analyze a phone screen.
    
    Args:
        image_path: Path to screenshot
        instruction: What to do with the screen
        
    Returns:
        AgentPlan with action details
    """
    agent = AutoGLMAgent()
    return agent.analyze_screen(image_path, instruction)


if __name__ == "__main__":
    # Example usage
    print("AutoGLM-Phone Integration for FraudGuard HK")
    print("=" * 50)
    
    # Example 1: Using AutoGLM-Phone directly
    print("\n1. AutoGLM-Phone Example:")
    print("   agent = AutoGLMAgent()")
    print('   plan = agent.analyze_screen("screenshot.png", "Open WhatsApp")')
    
    # Example 2: Using GLM-4.6V with grounding
    print("\n2. GLM-4.6V Example:")
    print("   from zai import ZhipuAiClient")
    print('   client = ZhipuAiClient(api_key="your_key")')
    print('   response = client.chat.completions.create(')
    print('       model="glm-4.6v",')
    print('       messages=[{...}]')
    print('   )')
