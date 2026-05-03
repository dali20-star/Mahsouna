import openai
import json
from typing import List, Dict

openai.api_key = "your-openai-api-key"  # Set via environment variable


class AIContentGenerator:
    """Service to generate AI-powered social media content"""
    
    @staticmethod
    def generate_social_media_plan(business_info: Dict) -> Dict:
        """
        Generate a week-long social media plan using OpenAI
        Returns: {'posts': [list of post objects for each day]}
        """
        
        prompt = f"""
        Based on the following business information, create a week-long social media marketing plan with 3 posts per day (Instagram, Facebook, Twitter).
        
        Business Name: {business_info.get('business_name', '')}
        Industry: {business_info.get('industry', '')}
        Target Audience: {', '.join(business_info.get('target_audience', []))}
        Goals: {', '.join(business_info.get('goals', []))}
        Description: {business_info.get('description', '')}
        
        For each day (Monday to Sunday), create 3 social media posts:
        1. Instagram post (with hashtags)
        2. Facebook post (with hashtags)
        3. Twitter post (with hashtags)
        
        Return the response as a JSON object with this structure:
        {{
            "Monday": {{
                "instagram": {{"caption": "...", "hashtags": [...]}},
                "facebook": {{"caption": "...", "hashtags": [...]}},
                "twitter": {{"caption": "...", "hashtags": [...]}}
            }},
            ... (repeat for other days)
        }}
        
        Make sure each post is engaging, relevant to the target audience, and aligned with their goals.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a social media marketing expert. Generate engaging and optimized social media posts."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            
            # Parse JSON from response
            try:
                plan_data = json.loads(content)
            except json.JSONDecodeError:
                # If direct JSON parsing fails, try to extract JSON
                plan_data = AIContentGenerator._extract_json(content)
            
            return plan_data
        
        except Exception as e:
            print(f"Error generating content: {str(e)}")
            return AIContentGenerator._get_fallback_plan(business_info)
    
    @staticmethod
    def _extract_json(text: str) -> Dict:
        """Extract JSON from text response"""
        import re
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except:
                pass
        return AIContentGenerator._get_fallback_plan({})
    
    @staticmethod
    def _get_fallback_plan(business_info: Dict) -> Dict:
        """Return fallback plan if AI generation fails"""
        business_name = business_info.get('business_name', 'Your Business')
        business_name_lower = business_name.lower().replace(' ', '')
        
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        plan = {}
        
        for day in days:
            plan[day] = {
                'instagram': {
                    'caption': f'Check out our latest updates! {business_name} is here to serve you better. #{business_name_lower} #community',
                    'hashtags': [f'#{business_name_lower}', '#business', '#community']
                },
                'facebook': {
                    'caption': f'Welcome to {business_name}! We are excited to connect with you and share our passion.',
                    'hashtags': [f'#{business_name_lower}', '#welcome', '#community']
                },
                'twitter': {
                    'caption': f'{business_name} here! 🚀 Ready to make a difference. Join us!',
                    'hashtags': [f'#{business_name_lower}', '#startup', '#innovation']
                }
            }
        
        return plan
